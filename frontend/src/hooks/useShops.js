import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/api/shop.api";
import { toast } from "@/hooks/use-toast";

const SHOPS_KEY = ["shops"];

export const useShops = (search = "") =>
  useQuery({
    queryKey: [...SHOPS_KEY, search],
    queryFn: () => shopApi.getAll(search),
    select: (res) => res.data,
  });

export const useShop = (id) =>
  useQuery({
    queryKey: [...SHOPS_KEY, "detail", id],
    queryFn: () => shopApi.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPS_KEY });
      toast({ variant: "success", title: "Shop added" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't add shop", description: err.message });
    },
  });
};

export const useUpdateShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...shop }) => shopApi.update(id, shop),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SHOPS_KEY });
      queryClient.invalidateQueries({ queryKey: [...SHOPS_KEY, "detail", variables.id] });
      toast({ variant: "success", title: "Shop updated" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't update shop", description: err.message });
    },
  });
};

export const useDeleteShop = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: shopApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHOPS_KEY });
      toast({ variant: "success", title: "Shop deleted" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't delete shop", description: err.message });
    },
  });
};
