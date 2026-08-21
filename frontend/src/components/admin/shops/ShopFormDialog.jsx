import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useCreateShop, useUpdateShop } from "@/hooks/useShops";
import { useWorkers } from "@/hooks/useWorkers";

/**
 * One dialog, two modes, same pattern as Product/Worker forms.
 * The worker dropdown only lists ACTIVE workers — assigning a shop to a
 * deactivated login would be confusing (and matches deleteWorker's own
 * "reassign shops before deleting" guard on the backend).
 */
const ShopFormDialog = ({ open, onOpenChange, shop }) => {
  const isEditMode = !!shop;

  const { data: workers } = useWorkers();
  const activeWorkers = workers?.filter((w) => w.isActive) || [];

  const createShop = useCreateShop();
  const updateShop = useUpdateShop();
  const isSubmitting = createShop.isPending || updateShop.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { shopName: "", ownerName: "", phone: "", address: "", assignedWorker: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        shopName: shop?.shopName || "",
        ownerName: shop?.ownerName || "",
        phone: shop?.phone || "",
        address: shop?.address || "",
        assignedWorker: shop?.assignedWorker?.id || "",
      });
    }
  }, [open, shop, reset]);

  const onSubmit = async (values) => {
    if (isEditMode) {
      await updateShop.mutateAsync({ id: shop.id, ...values });
    } else {
      await createShop.mutateAsync(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit shop" : "Add shop"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update this shop's details below." : "Add a new shop to your network."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="shopName">Shop name</Label>
              <Input
                id="shopName"
                placeholder="Al-Rehman Store"
                disabled={isSubmitting}
                aria-invalid={!!errors.shopName}
                {...register("shopName", { required: "Shop name is required" })}
              />
              {errors.shopName && <p className="text-xs text-destructive">{errors.shopName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner name</Label>
              <Input
                id="ownerName"
                placeholder="Ali Hassan"
                disabled={isSubmitting}
                aria-invalid={!!errors.ownerName}
                {...register("ownerName", { required: "Owner name is required" })}
              />
              {errors.ownerName && <p className="text-xs text-destructive">{errors.ownerName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="0300 0000000"
                disabled={isSubmitting}
                aria-invalid={!!errors.phone}
                {...register("phone", { required: "Phone number is required" })}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Main Boulevard, Gulberg, Lahore"
                disabled={isSubmitting}
                aria-invalid={!!errors.address}
                {...register("address", { required: "Address is required" })}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="assignedWorker">Assigned worker</Label>
              <Controller
                name="assignedWorker"
                control={control}
                rules={{ required: "An assigned worker is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                    <SelectTrigger id="assignedWorker" aria-invalid={!!errors.assignedWorker}>
                      <SelectValue placeholder="Select a worker" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeWorkers.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No active workers yet</div>
                      ) : (
                        activeWorkers.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name} · {w.area}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.assignedWorker && (
                <p className="text-xs text-destructive">{errors.assignedWorker.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? "Save changes" : "Add shop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ShopFormDialog;
