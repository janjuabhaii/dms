import mongoose from "mongoose";

/**
 * Worker model — the business-profile half of a worker. The auth identity
 * (name/email/password/role) lives on `User` (Phase 2); this document holds
 * everything specific to being a field salesperson: area, commission rate,
 * and running performance totals.
 *
 * Deliberately NOT stored here: `assignedShops`. Per the original schema
 * design, a Shop stores its own `assignedWorker` — that's the source of
 * truth for the relationship, and a worker's shop list is a derived query
 * (`Shop.find({ assignedWorker: workerId })`) once the Shop model exists
 * (Phase 6). Storing it on both sides would mean keeping two documents in
 * sync on every assignment change — the derived-query approach avoids that
 * class of bug entirely. Until Shop Management ships, the API just reports
 * an assigned-shop count of 0 rather than faking a relationship.
 *
 * `totalSales` / `totalOrders` / `totalCommissionEarned` start at zero for
 * every worker and are meant to be incremented by the Order creation flow
 * once that exists — not backfilled with fake numbers here.
 */
const workerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
      maxlength: [100, "Area cannot exceed 100 characters"],
    },
    commissionPercentage: {
      type: Number,
      required: [true, "Commission percentage is required"],
      min: [0, "Commission percentage cannot be negative"],
      max: [100, "Commission percentage cannot exceed 100"],
      default: 5,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCommissionEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const Worker = mongoose.model("Worker", workerSchema);

export default Worker;
