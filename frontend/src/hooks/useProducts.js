import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/api/product.api";
import { toast } from "@/hooks/use-toast";

const PRODUCTS_KEY = ["products"];

export const useProducts = (search = "") =>
  useQuery({
    queryKey: [...PRODUCTS_KEY, search],
    queryFn: () => productApi.getAll(search),
    select: (res) => res.data,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast({ variant: "success", title: "Product created", description: "It's now visible in the catalog." });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't create product", description: err.message });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...product }) => productApi.update(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast({ variant: "success", title: "Product updated" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't update product", description: err.message });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
      toast({ variant: "success", title: "Product deleted" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't delete product", description: err.message });
    },
  });
};
