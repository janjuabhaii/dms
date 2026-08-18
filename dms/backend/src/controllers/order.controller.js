import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import Worker from "../models/Worker.js";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Resolves the Worker profile for the currently logged-in user, or throws.
 * Every route in this file is worker-scoped, so this runs first in each one.
 */
const getWorkerForUser = async (userId) => {
  const worker = await Worker.findOne({ userId });
  if (!worker) {
    throw new ApiError(403, "No worker profile is linked to this account");
  }
  return worker;
};

const ALL_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

/**
 * Valid forward transitions. Cancellation is only allowed from pending or
 * confirmed — a delivered order is done, and reversing it would need a
 * separate "return" flow, not a status click. Both terminal states
 * (delivered, cancelled) have no further transitions.
 */
const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const toOrderDTO = (order) => ({
  id: order._id,
  shop: order.shopId
    ? { id: order.shopId._id, shopName: order.shopId.shopName, address: order.shopId.address }
    : null,
  products: order.products,
  totalAmount: order.totalAmount,
  paidAmount: order.paidAmount,
  remainingAmount: order.remainingAmount,
  deliveryDate: order.deliveryDate,
  status: order.status,
  createdAt: order.createdAt,
});

/**
 * Admin-facing shape — adds the worker's identity (name/email/area), since
 * an admin reviewing all orders needs to know who booked each one, which a
 * worker viewing their own history already implicitly knows.
 */
const toAdminOrderDTO = (order) => ({
  ...toOrderDTO(order),
  worker: order.workerId
    ? {
        id: order.workerId._id,
        name: order.workerId.userId?.name,
        email: order.workerId.userId?.email,
        area: order.workerId.area,
      }
    : null,
});

/**
 * POST /api/v1/orders
 * Worker only. This is the one place Products, Shops, and Workers all get
 * updated together:
 *   1. Each product's stock is decremented atomically (findOneAndUpdate
 *      with a `stock >= quantity` guard), so two workers racing to order
 *      the last units can't both succeed.
 *   2. If any line item fails (not found / insufficient stock), every
 *      already-decremented item in this same request is rolled back before
 *      the error is thrown — the order either fully succeeds or fully
 *      doesn't, even without a multi-document transaction.
 *   3. The Shop's totalPurchase/paidAmount/pendingAmount and the Worker's
 *      totalOrders/totalSales/totalCommissionEarned running totals are
 *      incremented — the exact update these fields were designed for back
 *      in Phase 5/6.
 *
 * Note: this uses sequential writes with manual compensation rather than a
 * MongoDB multi-document transaction, since transactions require a replica
 * set (not available on a plain standalone `mongod` most people run
 * locally). If this deploys against MongoDB Atlas or a replica set, this is
 * a reasonable place to upgrade to `session.withTransaction(...)`.
 */
export const createOrder = asyncHandler(async (req, res) => {
  const worker = await getWorkerForUser(req.user._id);

  const { shopId, products, deliveryDate, paidAmount } = req.body;

  if (!shopId) throw new ApiError(400, "A shop is required");
  if (!Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, "An order must contain at least one product");
  }
  if (!deliveryDate || Number.isNaN(new Date(deliveryDate).getTime())) {
    throw new ApiError(400, "A valid delivery date is required");
  }

  const shop = await Shop.findById(shopId);
  if (!shop) throw new ApiError(404, "Shop not found");
  if (String(shop.assignedWorker) !== String(worker._id)) {
    throw new ApiError(403, "This shop is not assigned to you");
  }

  // Decrement stock for each line item, tracking what succeeded so it can
  // be rolled back if a later item (or a payment validation) fails.
  const decremented = [];
  const orderProducts = [];

  const rollbackStock = () =>
    Promise.all(
      decremented.map(({ productId, quantity }) =>
        Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } })
      )
    );

  try {
    for (const item of products) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, "Each product needs a valid productId and a quantity of at least 1");
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!updatedProduct) {
        const existing = await Product.findById(item.productId);
        if (!existing) throw new ApiError(404, "One of the selected products no longer exists");
        throw new ApiError(400, `Not enough stock for "${existing.name}" (only ${existing.stock} left)`);
      }

      decremented.push({ productId: updatedProduct._id, quantity });
      orderProducts.push({
        productId: updatedProduct._id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        quantity,
        subtotal: updatedProduct.price * quantity,
      });
    }

    const totalAmount = orderProducts.reduce((sum, p) => sum + p.subtotal, 0);
    const paid = Number(paidAmount ?? 0);

    if (Number.isNaN(paid) || paid < 0) {
      throw new ApiError(400, "Paid amount must be a valid non-negative number");
    }
    if (paid > totalAmount) {
      throw new ApiError(400, "Paid amount cannot exceed the order total");
    }

    const remainingAmount = totalAmount - paid;
    const commissionEarned = (totalAmount * worker.commissionPercentage) / 100;

    const order = await Order.create({
      workerId: worker._id,
      shopId: shop._id,
      products: orderProducts,
      totalAmount,
      paidAmount: paid,
      remainingAmount,
      commissionEarned,
      deliveryDate,
    });

    await Shop.findByIdAndUpdate(shop._id, {
      $inc: { totalPurchase: totalAmount, paidAmount: paid, pendingAmount: remainingAmount },
    });

    await Worker.findByIdAndUpdate(worker._id, {
      $inc: { totalOrders: 1, totalSales: totalAmount, totalCommissionEarned: commissionEarned },
    });

    const populated = await order.populate("shopId", "shopName address");

    // Notify admins — deliberately outside the "did the order succeed"
    // critical path. If this fails (DB hiccup, no admins connected, etc.),
    // the order itself must still be returned as successful; the worker
    // shouldn't see an error for something entirely on the admin's side.
    try {
      const notification = await Notification.create({
        type: "order",
        recipientRole: "admin",
        message: `New order received from ${req.user.name} for ${shop.shopName}`,
        relatedOrder: order._id,
      });

      req.app.get("io")?.to("admins").emit("notification:new", {
        id: notification._id,
        type: notification.type,
        message: notification.message,
        relatedOrder: notification.relatedOrder,
        isRead: notification.readStatus,
        createdAt: notification.createdAt,
      });
    } catch (notifyErr) {
      console.error("[order] Failed to create/emit new-order notification:", notifyErr.message);
    }

    res.status(201).json(new ApiResponse(201, toOrderDTO(populated), "Order created successfully"));
  } catch (err) {
    await rollbackStock();
    throw err;
  }
});

/**
 * GET /api/v1/orders/mine?search=&status=
 * Worker only. Their own order history — `search` matches shop name.
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const worker = await getWorkerForUser(req.user._id);
  const { status } = req.query;

  const filter = { workerId: worker._id };
  if (status && ALL_STATUSES.includes(status)) {
    filter.status = status;
  }

  let orders = await Order.find(filter).populate("shopId", "shopName address").sort({ createdAt: -1 });

  if (req.query.search) {
    const term = req.query.search.toLowerCase();
    orders = orders.filter((o) => o.shopId?.shopName?.toLowerCase().includes(term));
  }

  res.status(200).json(new ApiResponse(200, orders.map(toOrderDTO), "Orders fetched successfully"));
});

/**
 * GET /api/v1/orders/mine/:id
 * Worker only, and only their own order — a worker fetching another
 * worker's order by guessing an id gets a 404, not a 403 (doesn't confirm
 * the id even exists to someone probing it).
 */
export const getMyOrderById = asyncHandler(async (req, res) => {
  const worker = await getWorkerForUser(req.user._id);

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, "Order not found");
  }

  const order = await Order.findOne({ _id: req.params.id, workerId: worker._id }).populate(
    "shopId",
    "shopName address phone"
  );

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(new ApiResponse(200, toOrderDTO(order), "Order fetched successfully"));
});

/**
 * GET /api/v1/orders?search=&status=
 * Admin only. Every order across every worker/shop. `search` matches shop
 * name or the worker's name (populated from the linked User).
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;

  const filter = {};
  if (status && ALL_STATUSES.includes(status)) {
    filter.status = status;
  }

  let orders = await Order.find(filter)
    .populate("shopId", "shopName address")
    .populate({ path: "workerId", populate: { path: "userId", select: "name email" } })
    .sort({ createdAt: -1 });

  if (search) {
    const term = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.shopId?.shopName?.toLowerCase().includes(term) ||
        o.workerId?.userId?.name?.toLowerCase().includes(term)
    );
  }

  res.status(200).json(new ApiResponse(200, orders.map(toAdminOrderDTO), "Orders fetched successfully"));
});

/**
 * GET /api/v1/orders/:id
 * Admin only. Full detail for any order — worker, shop, products, payment,
 * delivery date, everything the order management UI needs in one call.
 */
export const getOrderById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(404, "Order not found");
  }

  const order = await Order.findById(req.params.id)
    .populate("shopId", "shopName address phone")
    .populate({ path: "workerId", populate: { path: "userId", select: "name email phone" } });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  res.status(200).json(new ApiResponse(200, toAdminOrderDTO(order), "Order fetched successfully"));
});

/**
 * PATCH /api/v1/orders/:id/status
 * Admin only. Moves an order through pending → confirmed → delivered, or
 * to cancelled from pending/confirmed. Any other transition (including
 * re-activating a cancelled/delivered order) is rejected.
 *
 * Cancelling reverses every side effect createOrder applied: stock is
 * restored per line item, and the Shop/Worker running totals are decremented
 * by exactly the amounts recorded on the order (totalAmount, paidAmount,
 * remainingAmount, commissionEarned) — the same "sequential writes, no
 * multi-document transaction" trade-off as order creation applies here too.
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status: nextStatus } = req.body;

  if (!ALL_STATUSES.includes(nextStatus)) {
    throw new ApiError(400, `Status must be one of: ${ALL_STATUSES.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const allowedNext = ALLOWED_TRANSITIONS[order.status] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new ApiError(
      400,
      `Cannot move an order from "${order.status}" to "${nextStatus}"`
    );
  }

  if (nextStatus === "cancelled") {
    await Promise.all(
      order.products.map((item) =>
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
      )
    );

    await Shop.findByIdAndUpdate(order.shopId, {
      $inc: {
        totalPurchase: -order.totalAmount,
        paidAmount: -order.paidAmount,
        pendingAmount: -order.remainingAmount,
      },
    });

    await Worker.findByIdAndUpdate(order.workerId, {
      $inc: {
        totalOrders: -1,
        totalSales: -order.totalAmount,
        totalCommissionEarned: -order.commissionEarned,
      },
    });
  }

  order.status = nextStatus;
  await order.save();

  await order.populate("shopId", "shopName address");
  await order.populate({ path: "workerId", populate: { path: "userId", select: "name email" } });

  res.status(200).json(new ApiResponse(200, toAdminOrderDTO(order), "Order status updated"));
});
