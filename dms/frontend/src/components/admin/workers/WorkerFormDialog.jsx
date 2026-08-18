import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateWorker, useUpdateWorker } from "@/hooks/useWorkers";

/**
 * One dialog, two modes. `worker` present = editing (identity + profile
 * fields pre-filled, plus an active/inactive toggle; no password field —
 * credential changes are a separate, more guarded flow). `worker` null =
 * creating (includes password, since this is also account creation).
 */
const WorkerFormDialog = ({ open, onOpenChange, worker }) => {
  const isEditMode = !!worker;
  const [isActive, setIsActive] = useState(true);

  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();
  const isSubmitting = createWorker.isPending || updateWorker.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", email: "", password: "", phone: "", area: "", commissionPercentage: 5 },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: worker?.name || "",
        email: worker?.email || "",
        password: "",
        phone: worker?.phone || "",
        area: worker?.area || "",
        commissionPercentage: worker?.commissionPercentage ?? 5,
      });
      setIsActive(worker?.isActive ?? true);
    }
  }, [open, worker, reset]);

  const onSubmit = async (values) => {
    if (isEditMode) {
      const { password, ...rest } = values;
      await updateWorker.mutateAsync({ id: worker.id, ...rest, isActive });
    } else {
      await createWorker.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit worker" : "Add worker"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update this worker's details below."
              : "Creates a login account and business profile together."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                placeholder="Ahmed Raza"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ahmed@dms.local"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" placeholder="0300 0000000" disabled={isSubmitting} {...register("phone")} />
            </div>

            {!isEditMode && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                placeholder="Lahore"
                disabled={isSubmitting}
                aria-invalid={!!errors.area}
                {...register("area", { required: "Area is required" })}
              />
              {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionPercentage">Commission %</Label>
              <Input
                id="commissionPercentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                disabled={isSubmitting}
                aria-invalid={!!errors.commissionPercentage}
                {...register("commissionPercentage", {
                  required: "Commission is required",
                  min: { value: 0, message: "Must be at least 0" },
                  max: { value: 100, message: "Cannot exceed 100" },
                })}
              />
              {errors.commissionPercentage && (
                <p className="text-xs text-destructive">{errors.commissionPercentage.message}</p>
              )}
            </div>

            {isEditMode && (
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Account active</p>
                  <p className="text-xs text-muted-foreground">Inactive workers can't log in.</p>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} disabled={isSubmitting} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? "Save changes" : "Add worker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WorkerFormDialog;
