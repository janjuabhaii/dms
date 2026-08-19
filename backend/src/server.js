import http from "http";
import { Server as SocketIOServer } from "socket.io";

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { socketAuth } from "./middleware/socketAuth.js";

const httpServer = http.createServer(app);

// Socket.io is initialized here (not in app.js) because it needs the raw
// http server, not the Express app.
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.clientUrl,
    credentials: true,
  },
});

io.use(socketAuth);

/**
 * Every connected admin joins a shared "admins" room. Order creation
 * (order.controller.js) emits "notification:new" to that room — so every
 * admin device/tab connected at that moment gets the push instantly,
 * without the controller needing to know how many admins exist or track
 * socket ids itself.
 */
io.on("connection", (socket) => {
  console.log(`[socket] ${socket.user.role} connected: ${socket.user.name} (${socket.id})`);

  if (socket.user.role === "admin") {
    socket.join("admins");
  }

  socket.on("disconnect", () => {
    console.log(`[socket] disconnected: ${socket.user.name} (${socket.id})`);
  });
});

// Make `io` accessible from controllers via req.app.get("io") later
app.set("io", io);

const startServer = async () => {
  await connectDB();

  httpServer.listen(env.port, () => {
    console.log(`[server] DMS API running in ${env.nodeEnv} mode on port ${env.port}`);
  });
};

startServer();

// ---- Graceful shutdown & safety nets ---------------------------------------
const shutdown = async (signal) => {
  console.log(`[server] ${signal} received. Shutting down gracefully...`);
  httpServer.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled Promise Rejection:", reason);
  httpServer.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("[server] Uncaught Exception:", error);
  process.exit(1);
});
