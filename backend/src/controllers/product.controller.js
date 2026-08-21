import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";

/**
 * Shared validation for numeric fields coming from multipart/form-data,
 * where every field arrives as a string regardless of its logical type.
 */
const parseNumberField = (value, fieldName, { required = true, min = 0 } = {}) => {
  if (value === undefined || value === "") {
    if (required) throw new ApiError(400, `${fieldName} is required`);
    return undefined;
  }
  const num = Number(value);
  if (Number.isNaN(num)) throw new ApiError(400, `${fieldName} must be a number`);
  if (num < min) throw new ApiError(400, `${fieldName} cannot be less than ${min}`);
  return num;
};

/**
 * POST /api/v1/products
 * Admin only. Multipart form: name, price, description, stock, image (file).
 * Image is required on creation — mirrors the business flow where every
 * product needs a photo for workers to show shopkeepers.
 */
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description = "" } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Product name is required");
  }

  const price = parseNumberField(req.body.price, "Price");
  const stock = parseNumberField(req.body.stock, "Stock", { required: false }) ?? 0;

  if (!req.file) {
    throw new ApiError(400, "Product image is required");
  }

  const image = await uploadBufferToCloudinary(req.file.buffer);

  const product = await Product.create({
    name: name.trim(),
    description: description.trim(),
    price,
    stock,
    image,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

/**
 * GET /api/v1/products?search=...
 * Accessible to both admin and worker (workers browse the catalog to build
 * orders in Phase 5). Optional case-insensitive name search.
 */
export const getProducts = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = search ? { name: { $regex: search, $options: "i" } } : {};

  const products = await Product.find(filter).sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
});

/**
 * GET /api/v1/products/:id
 */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

/**
 * PUT /api/v1/products/:id
 * Admin only. All fields optional (partial update). If a new image file is
 * sent, the old Cloudinary asset is deleted after the new one uploads
 * successfully, so a failed upload never leaves the product without an image.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const { name, description } = req.body;

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, "Product name cannot be empty");
    product.name = name.trim();
  }

  if (description !== undefined) {
    product.description = description.trim();
  }

  if (req.body.price !== undefined) {
    product.price = parseNumberField(req.body.price, "Price");
  }

  if (req.body.stock !== undefined) {
    product.stock = parseNumberField(req.body.stock, "Stock", { required: false });
  }

  if (req.file) {
    const newImage = await uploadBufferToCloudinary(req.file.buffer);
    const oldPublicId = product.image?.publicId;
    product.image = newImage;
    await deleteFromCloudinary(oldPublicId);
  }

  await product.save();

  res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

/**
 * DELETE /api/v1/products/:id
 * Admin only. Removes the Cloudinary asset alongside the document.
 */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await deleteFromCloudinary(product.image?.publicId);
  await product.deleteOne();

  res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});
