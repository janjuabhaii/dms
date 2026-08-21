import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toNotificationDTO = (n) => ({
  id: n._id,
  type: n.type,
  message: n.message,
  relatedOrder: n.relatedOrder,
  isRead: n.readStatus,
  createdAt: n.createdAt,
});

/**
 * GET /api/v1/notifications
 * Scoped by the caller's own role (currently only "admin" routes are
 * mounted, but this reads req.user.role rather than hardcoding "admin" so
 * a future worker-facing notification feed can reuse this same controller
 * unchanged — just mount it behind `authorize("worker")` too).
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipientRole: req.user.role })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipientRole: req.user.role,
    readStatus: false,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      { notifications: notifications.map(toNotificationDTO), unreadCount },
      "Notifications fetched successfully"
    )
  );
});

/**
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientRole: req.user.role },
    { readStatus: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(new ApiResponse(200, toNotificationDTO(notification), "Notification marked as read"));
});

/**
 * PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipientRole: req.user.role, readStatus: false },
    { readStatus: true }
  );

  res.status(200).json(new ApiResponse(200, null, "All notifications marked as read"));
});
