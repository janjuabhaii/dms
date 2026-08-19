import mongoose from "mongoose";
import { env } from "../config/env.js";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

/**
 * Creates the first Admin account so there's a way to log in at all
 * (registration is admin-only and gated behind auth — a chicken-and-egg
 * problem this script solves once, at setup time).
 *
 * Usage:
 *   npm run seed:admin
 *
 * Reads credentials from env vars if present, otherwise falls back to
 * a clearly-labeled default the developer is expected to change immediately.
 */
const ADMIN_NAME = process.env.ADMIN_SEED_NAME || "Business Owner";
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || "admin@dms.local";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "Admin@12345";

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    console.log(`[seed] Admin account already exists for ${ADMIN_EMAIL}. Nothing to do.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const admin = await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("[seed] Admin account created:");
  console.log(`        email:    ${admin.email}`);
  console.log(`        password: ${ADMIN_PASSWORD}  (change this after first login)`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error("[seed] Failed to seed admin account:", err.message);
  await mongoose.connection.close();
  process.exit(1);
});
