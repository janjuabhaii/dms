import mongoose from "mongoose";

/**
 * Notification model. `recipientRole` (rather than a specific recipientId)
 * is deliberate: "New order received" is relevant to every admin session,
 * not one specific admin user — mirrors how the Socket.io side broadcasts
 * to a shared `role:admin` room rather than one user's room. If a future
 * phase needs per-user notifications (e.g. "your commission was paid" sent
 * to one specific worker), add a `recipientId` field alongside this one
 * rather than replacing it.
 */
const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["order"],
      default: "order",
    },
    recipientRole: {
      type: String,
      enum: ["admin", "worker"],
      required: true,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    readStatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientRole: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
