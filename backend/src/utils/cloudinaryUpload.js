import cloudinary from "../config/cloudinary.js";

/**
 * Uploads an in-memory file buffer (from multer) to Cloudinary.
 * Cloudinary's SDK only offers a stream-based API for buffer uploads, so
 * this wraps it in a Promise for clean async/await use in controllers.
 */
export const uploadBufferToCloudinary = (buffer, folder = "dms/products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
};

/**
 * Deletes an asset from Cloudinary by its public_id. Used when a product's
 * image is replaced (delete the old one) or the product itself is deleted,
 * so storage doesn't accumulate orphaned images.
 * Failures are swallowed (logged only) — a stale Cloudinary asset is a much
 * smaller problem than a failed product update/delete because cleanup failed.
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`[cloudinary] Failed to delete asset ${publicId}:`, error.message);
  }
};
