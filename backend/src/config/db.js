import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("strictQuery", true);

/**
 * Connects to MongoDB using Mongoose.
 * Exits the process on failure since the API cannot function without a DB.
 * Logs connection state changes so issues are visible in production logs.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);

    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error(`[db] MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[db] MongoDB disconnected");
    });

    return conn;
  } catch (error) {
    console.error(`[db] Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Gracefully closes the MongoDB connection.
 * Used during server shutdown (SIGINT/SIGTERM handlers in server.js).
 */
export const disconnectDB = async () => {
  await mongoose.connection.close();
  console.log("[db] MongoDB connection closed");
};
