import Shop from "../models/Shop.js";
import Worker from "../models/Worker.js";
import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const WORKER_POPULATE = { path: "assignedWorker", populate: { path: "userId", select: "name email phone" } };

/**
 * Shapes a Shop doc (with populated assignedWorker → userId) into the flat
 * object the frontend wants, so it never has to know the worker relationship
 * spans two collections.
 */
const toShopDTO = (shop) => {
  const worker = shop.assignedWorker;
  return {
    id: shop._id,
    shopName: shop.shopName,
    ownerName: shop.ownerName,
    phone: shop.phone,
    address: shop.address,
    totalPurchase: shop.totalPurchase,
    paidAmount: shop.paidAmount,
    pendingAmount: shop.pendingAmount,
    createdAt: shop.createdAt,
    assignedWorker: worker
      ? {
          id: worker._id,
          name: worker.userId?.name,
          email: worker.userId?.email,
          phone: worker.userId?.phone,
          area: worker.area,
          commissionPercentage: worker.commissionPercentage,
        }
      : null,
  };
};

const assertWorkerExists = async (workerId) => {
  const worker = await Worker.findById(workerId);
  if (!worker) {
    throw new ApiError(400, "Assigned worker not found");
  }
  return worker;
};

/**
 * POST /api/v1/shops
 * Admin only.
 */
export const createShop = asyncHandler(async (req, res) => {
  const { shopName, ownerName, phone, address, assignedWorker } = req.body;

  if (!shopName?.trim() || !ownerName?.trim() || !phone?.trim() || !address?.trim()) {
    throw new ApiError(400, "Shop name, owner name, phone, and address are all required");
  }
  if (!assignedWorker) {
    throw new ApiError(400, "An assigned worker is required");
  }

  await assertWorkerExists(assignedWorker);

  const shop = await Shop.create({
    shopName: shopName.trim(),
    ownerName: ownerName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    assignedWorker,
    createdBy: req.user._id,
  });

  const populated = await shop.populate(WORKER_POPULATE);

  res.status(201).json(new ApiResponse(201, toShopDTO(populated), "Shop created successfully"));
});

/**
 * GET /api/v1/shops?search=&worker=
 * Admin: sees all shops; `search` matches shop name, owner name, or address;
 * `worker` (a Worker id) filters to a specific worker's shops.
 * Worker: automatically scoped to their OWN assigned shops only — any
 * `worker` query param they send is ignored rather than trusted, since a
 * worker requesting someone else's shop list is exactly what this guards
 * against. This is how a worker's shop list populates in Phase 7's order
 * creation flow.
 */
export const getShops = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { shopName: { $regex: search, $options: "i" } },
      { ownerName: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  if (req.user.role === "worker") {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      throw new ApiError(403, "No worker profile is linked to this account");
    }
    filter.assignedWorker = worker._id;
  } else if (req.query.worker) {
    filter.assignedWorker = req.query.worker;
  }

  const shops = await Shop.find(filter).populate(WORKER_POPULATE).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, shops.map(toShopDTO), "Shops fetched successfully"));
});

/**
 * GET /api/v1/shops/:id
 * Admin: full access, powers the Shop Profile page — shop info, assigned
 * worker, financial totals, and order history all in one call.
 * Worker: can only view a shop that's assigned to them (403 otherwise) —
 * used when reviewing a shop before creating an order against it.
 */
export const getShopById = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate(WORKER_POPULATE);

  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  if (req.user.role === "worker") {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker || shop.assignedWorker?._id?.toString() !== worker._id.toString()) {
      throw new ApiError(403, "This shop is not assigned to you");
    }
  }

  // Phase 8 wires this up for real — until now this was a hardcoded empty
  // array since the Order model didn't exist yet (see git history / the
  // Phase 6 README note this comment replaces).
  const orders = await Order.find({ shopId: shop._id })
    .populate({ path: "workerId", populate: { path: "userId", select: "name" } })
    .sort({ createdAt: -1 })
    .limit(50);

  const orderHistory = orders.map((order) => ({
    id: order._id,
    workerName: order.workerId?.userId?.name || "—",
    deliveryDate: order.deliveryDate,
    status: order.status,
    totalAmount: order.totalAmount,
    remainingAmount: order.remainingAmount,
  }));

  res
    .status(200)
    .json(new ApiResponse(200, { ...toShopDTO(shop), orderHistory }, "Shop fetched successfully"));
});

/**
 * PUT /api/v1/shops/:id
 * Admin only. Includes reassigning the worker.
 */
export const updateShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  const { shopName, ownerName, phone, address, assignedWorker } = req.body;

  if (shopName !== undefined) {
    if (!shopName.trim()) throw new ApiError(400, "Shop name cannot be empty");
    shop.shopName = shopName.trim();
  }
  if (ownerName !== undefined) {
    if (!ownerName.trim()) throw new ApiError(400, "Owner name cannot be empty");
    shop.ownerName = ownerName.trim();
  }
  if (phone !== undefined) {
    if (!phone.trim()) throw new ApiError(400, "Phone cannot be empty");
    shop.phone = phone.trim();
  }
  if (address !== undefined) {
    if (!address.trim()) throw new ApiError(400, "Address cannot be empty");
    shop.address = address.trim();
  }
  if (assignedWorker !== undefined) {
    await assertWorkerExists(assignedWorker);
    shop.assignedWorker = assignedWorker;
  }

  await shop.save();
  const populated = await shop.populate(WORKER_POPULATE);

  res.status(200).json(new ApiResponse(200, toShopDTO(populated), "Shop updated successfully"));
});

/**
 * DELETE /api/v1/shops/:id
 * Admin only.
 */
export const deleteShop = asyncHandler(async (req, res) => {
  const shop = await Shop.findById(req.params.id);

  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  await shop.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Shop deleted successfully"));
});
