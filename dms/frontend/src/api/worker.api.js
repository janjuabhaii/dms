import axiosInstance from "./axiosInstance";

export const workerApi = {
  getAll: (search = "") => axiosInstance.get("/workers", { params: search ? { search } : {} }),

  getById: (id) => axiosInstance.get(`/workers/${id}`),

  getMe: () => axiosInstance.get("/workers/me"),

  create: (worker) => axiosInstance.post("/workers", worker),

  update: (id, worker) => axiosInstance.put(`/workers/${id}`, worker),

  remove: (id) => axiosInstance.delete(`/workers/${id}`),
};
