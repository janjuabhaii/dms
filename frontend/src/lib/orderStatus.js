export const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

export const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "default",
  delivered: "success",
  cancelled: "destructive",
};

/**
 * Mirrors ALLOWED_TRANSITIONS in the backend's order.controller.js. Used to
 * only offer valid next-statuses in the admin status-change UI, so a bad
 * transition gets caught before the request even goes out, not just after
 * the server rejects it.
 */
export const ALLOWED_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};
