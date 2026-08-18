import mongoose from "mongoose";

/**
 * Product model. `image` stores both the Cloudinary secure URL (what the
 * frontend renders) and the Cloudinary public_id (needed to delete/replace
 * the asset later without leaking orphaned images in Cloudinary storage).
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Supports the ?search= query param in getProducts (case-insensitive name match)
productSchema.index({ name: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
