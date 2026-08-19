import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

const { cloudName, apiKey, apiSecret } = env.cloudinary;

if (!cloudName || !apiKey || !apiSecret) {
  // eslint-disable-next-line no-console
  console.warn(
    "[cloudinary] Missing CLOUDINARY_* env vars — image upload endpoints will fail until they're set."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;
