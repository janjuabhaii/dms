import axios from "axios";

/**
 * Every network call in the app goes through this instance.
 * - baseURL points at /api/v1, proxied to the backend in dev (see vite.config.js)
 *   and served from the same origin in production.
 * - Request interceptor attaches the JWT from localStorage, if present.
 * - Response interceptor unwraps the ApiResponse envelope on success and
 *   normalizes errors to the backend's ApiError shape, plus redirects to
 *   /login on 401 so expired sessions are handled in one place.
 */
const axiosInstance = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // allow httpOnly cookie-based auth alongside bearer tokens
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("dms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data, // unwrap { success, statusCode, message, data }
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || "Network error";

    if (status === 401) {
      localStorage.removeItem("dms_token");
      // Avoid a hard redirect loop if we're already on the login page
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default axiosInstance;
