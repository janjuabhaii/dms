import axiosInstance from "./axiosInstance";

export const reportApi = {
  getDashboardSummary: () => axiosInstance.get("/reports/dashboard-summary"),

  getSales: (params = {}) => axiosInstance.get("/reports/sales", { params }),

  getWorkerPerformance: (params = {}) => axiosInstance.get("/reports/worker-performance", { params }),

  getPendingPayments: () => axiosInstance.get("/reports/pending-payments"),

  getShopPurchaseHistory: () => axiosInstance.get("/reports/shop-purchase-history"),

  getCommissions: () => axiosInstance.get("/reports/commissions"),
};
