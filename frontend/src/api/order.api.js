import axiosInstance from "./axiosInstance";

export const orderApi = {
  create: (order) => axiosInstance.post("/orders", order),

  getMine: (params = {}) => axiosInstance.get("/orders/mine", { params }),

  getMineById: (id) => axiosInstance.get(`/orders/mine/${id}`),

  // Admin-only
  getAll: (params = {}) => axiosInstance.get("/orders", { params }),

  getById: (id) => axiosInstance.get(`/orders/${id}`),

  updateStatus: (id, status) => axiosInstance.patch(`/orders/${id}/status`, { status }),
};
