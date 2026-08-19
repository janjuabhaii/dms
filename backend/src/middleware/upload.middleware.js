import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

/**
 * Files are kept in memory (as a Buffer) rather than written to disk, since
 * every upload is immediately forwarded to Cloudinary — there's no need for
 * a local temp file, which also means nothing to clean up and nothing that
 * breaks in serverless/ephemeral-filesystem deployments later.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new ApiError(400, "Only image files are allowed"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
