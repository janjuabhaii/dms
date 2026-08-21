import axiosInstance from "./axiosInstance";

/**
 * All auth-related network calls in one place. Returns the unwrapped
 * `data` payload (axiosInstance's response interceptor already unwraps
 * the { success, statusCode, message, data } envelope).
 */
export const authApi = {
  login: (email, password) => axiosInstance.post("/auth/login", { email, password }),

  me: () => axiosInstance.get("/auth/me"),

  logout: () => axiosInstance.post("/auth/logout"),
};
