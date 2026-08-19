import { Loader2, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/useProducts";

const DeleteProductDialog = ({ open, onOpenChange, product }) => {
  const deleteProduct = useDeleteProduct();

  const handleConfirm = async () => {
    if (!product) return;
    await deleteProduct.mutateAsync(product._id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle className="mt-3">Delete "{product?.name}"?</DialogTitle>
          <DialogDescription>
            This permanently removes the product and its image. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteProduct.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteProduct.isPending}>
            {deleteProduct.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductDialog;
