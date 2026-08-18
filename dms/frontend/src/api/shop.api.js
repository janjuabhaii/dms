import axiosInstance from "./axiosInstance";

export const shopApi = {
  getAll: (search = "") => axiosInstance.get("/shops", { params: search ? { search } : {} }),

  getById: (id) => axiosInstance.get(`/shops/${id}`),

  create: (shop) => axiosInstance.post("/shops", shop),

  update: (id, shop) => axiosInstance.put(`/shops/${id}`, shop),

  remove: (id) => axiosInstance.delete(`/shops/${id}`),
};
