import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/api/report.api";

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["reports", "dashboard-summary"],
    queryFn: reportApi.getDashboardSummary,
    select: (res) => res.data,
  });

export const useSalesReport = (range) =>
  useQuery({
    queryKey: ["reports", "sales", range],
    queryFn: () => reportApi.getSales(range),
    select: (res) => res.data,
  });

export const useWorkerPerformanceReport = (range) =>
  useQuery({
    queryKey: ["reports", "worker-performance", range],
    queryFn: () => reportApi.getWorkerPerformance(range),
    select: (res) => res.data,
  });

export const usePendingPaymentsReport = () =>
  useQuery({
    queryKey: ["reports", "pending-payments"],
    queryFn: reportApi.getPendingPayments,
    select: (res) => res.data,
  });

export const useShopPurchaseHistoryReport = () =>
  useQuery({
    queryKey: ["reports", "shop-purchase-history"],
    queryFn: reportApi.getShopPurchaseHistory,
    select: (res) => res.data,
  });

export const useCommissionReport = () =>
  useQuery({
    queryKey: ["reports", "commissions"],
    queryFn: reportApi.getCommissions,
    select: (res) => res.data,
  });
