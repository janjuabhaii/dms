import mongoose from "mongoose";

/**
 * Shop model. `assignedWorker` is the single source of truth for the
 * worker↔shop relationship (see the design note in Worker.js) — a worker's
 * shop list is always derived by querying shops where `assignedWorker`
 * matches, never stored redundantly on the Worker side.
 *
 * `totalPurchase` / `paidAmount` / `pendingAmount` are real running totals,
 * not editable by the admin directly — they start at 0 for every shop and
 * are meant to be updated by the Order/Payment flow once it exists (Phase 7),
 * the same pattern used for Worker.totalSales. Showing real zeros here is
 * more honest than pre-populating fake numbers.
 */
const shopSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      maxlength: [150, "Shop name cannot exceed 150 characters"],
    },
    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
      maxlength: [100, "Owner name cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "An assigned worker is required"],
    },
    totalPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

shopSchema.index({ shopName: "text", ownerName: "text", address: "text" });

const Shop = mongoose.model("Shop", shopSchema);

export default Shop;
