import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workerApi } from "@/api/worker.api";
import { toast } from "@/hooks/use-toast";

const WORKERS_KEY = ["workers"];

export const useWorkers = (search = "") =>
  useQuery({
    queryKey: [...WORKERS_KEY, search],
    queryFn: () => workerApi.getAll(search),
    select: (res) => res.data,
  });

/**
 * The logged-in worker's own profile (GET /workers/me) — used by the worker
 * portal's Profile tab. Distinct from useWorkers/useWorker(id), which are
 * admin-only and would 403 for a worker role.
 */
export const useMyWorkerProfile = () =>
  useQuery({
    queryKey: [...WORKERS_KEY, "me"],
    queryFn: () => workerApi.getMe(),
    select: (res) => res.data,
  });

export const useCreateWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKERS_KEY });
      toast({ variant: "success", title: "Worker added", description: "Their login is ready to use." });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't add worker", description: err.message });
    },
  });
};

export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...worker }) => workerApi.update(id, worker),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKERS_KEY });
      toast({ variant: "success", title: "Worker updated" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't update worker", description: err.message });
    },
  });
};

export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: workerApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKERS_KEY });
      toast({ variant: "success", title: "Worker removed" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Couldn't remove worker", description: err.message });
    },
  });
};
