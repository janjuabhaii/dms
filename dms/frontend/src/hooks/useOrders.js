import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/api/order.api";
import { toast } from "@/hooks/use-toast";

const ORDERS_KEY = ["orders"];
const PRODUCTS_KEY = ["products"];
const SHOPS_KEY = ["shops"];

export const useMyOrders = (params = {}) =>
  useQuery({
    queryKey: [...ORDERS_KEY, "mine", params],
    queryFn: () => orderApi.getMine(params),
    select: (res) => res.data,
  });

export const useMyOrder = (id) =>
  useQuery({
    queryKey: [...ORDERS_KEY, "mine", "detail", id],
    queryFn: () => orderApi.getMineById(id),
    select: (res) => res.data,
    enabled: !!id,
  });

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: orderApi.create,
    onSuccess: () => {
      // An order changes product stock and shop balances too, so those
      // cached lists need to be treated as stale, not just orders.
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: SHOPS_KEY });
      toast({ variant: "success", title: "Order submitted", description: "The shop's ledger has been updated." });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't submit order", description: err.message });
    },
  });
};

// ---- Admin-facing (Phase 8) -------------------------------------------

export const useAllOrders = (params = {}) =>
  useQuery({
    queryKey: [...ORDERS_KEY, "all", params],
    queryFn: () => orderApi.getAll(params),
    select: (res) => res.data,
  });

export const useOrder = (id) =>
  useQuery({
    queryKey: [...ORDERS_KEY, "detail", id],
    queryFn: () => orderApi.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, status),
    onSuccess: () => {
      // Cancelling reverses stock + shop/worker totals, so those need
      // refreshing too, not just the order lists.
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      queryClient.invalidateQueries({ queryKey: SHOPS_KEY });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ variant: "success", title: "Order status updated" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't update status", description: err.message });
    },
  });
};
