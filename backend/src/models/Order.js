import mongoose from "mongoose";

/**
 * Order model. Each line item snapshots the product's `name` and `price`
 * at the moment of purchase — pulled from the live Product document during
 * creation, then frozen here. If an admin changes a product's price next
 * week, every past order still shows what the shop was actually charged,
 * not today's price. `productId` is kept too, purely for reference (e.g.
 * "which products sell best"), not for displaying current price/stock.
 *
 * `commissionEarned` is likewise a snapshot — the worker's commission
 * percentage at the moment this order was placed, applied to totalAmount.
 * It's stored (not recomputed from the worker's *current* commission rate)
 * so that if an admin changes a worker's commission % next month, cancelling
 * an old order still reverses exactly what was originally credited, not a
 * different amount based on today's rate.
 *
 * Creating an order is the one place that ties Products, Shops, and Workers
 * together: it decrements Product.stock, and increments Shop's totalPurchase/
 * paidAmount/pendingAmount and Worker's totalOrders/totalSales/
 * totalCommissionEarned. Cancelling an order (Phase 8) reverses all of that —
 * see order.controller.js for both directions of this logic.
 *
 * Status lifecycle: pending → confirmed → delivered, with cancellation only
 * possible from pending or confirmed (a delivered order is done; reversing
 * it would need a separate "return" flow, out of scope here).
 */
const orderProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    products: {
      type: [orderProductSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "An order must contain at least one product",
      },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0, default: 0 },
    remainingAmount: { type: Number, required: true, min: 0 },
    commissionEarned: { type: Number, required: true, min: 0, default: 0 },
    deliveryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

orderSchema.index({ workerId: 1, createdAt: -1 });
orderSchema.index({ shopId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
