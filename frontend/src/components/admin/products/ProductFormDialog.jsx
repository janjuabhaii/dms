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
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/common/ImageUpload";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";

/**
 * One dialog, two modes: `product` present = editing (fields pre-filled,
 * image optional on submit — keeps the existing one if untouched); `product`
 * null = creating (image required).
 */
const ProductFormDialog = ({ open, onOpenChange, product }) => {
  const isEditMode = !!product;
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const isSubmitting = createProduct.isPending || updateProduct.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", price: "", stock: "", description: "" },
  });

  // Re-seed the form whenever the dialog opens for a (possibly different) product
  useEffect(() => {
    if (open) {
      reset({
        name: product?.name || "",
        price: product?.price ?? "",
        stock: product?.stock ?? "",
        description: product?.description || "",
      });
      setImageFile(null);
      setImageError("");
    }
  }, [open, product, reset]);

  const onSubmit = async (values) => {
    if (!isEditMode && !imageFile) {
      setImageError("Product image is required.");
      return;
    }

    const payload = { ...values, imageFile };

    if (isEditMode) {
      await updateProduct.mutateAsync({ id: product._id, ...payload });
    } else {
      await createProduct.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update this product's details below."
              : "Add a new product to your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Product image</Label>
            <ImageUpload
              previewUrl={product?.image?.url}
              onChange={(file) => {
                setImageFile(file);
                if (file) setImageError("");
              }}
              disabled={isSubmitting}
            />
            {imageError && <p className="text-xs text-destructive">{imageError}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                placeholder="Surf Excel 1kg"
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="250"
                disabled={isSubmitting}
                aria-invalid={!!errors.price}
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price cannot be negative" },
                })}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="500"
                disabled={isSubmitting}
                aria-invalid={!!errors.stock}
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock cannot be negative" },
                })}
              />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Washing powder, 1kg pack"
                disabled={isSubmitting}
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
