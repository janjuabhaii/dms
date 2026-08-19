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
import { useDeleteShop } from "@/hooks/useShops";

const DeleteShopDialog = ({ open, onOpenChange, shop, onDeleted }) => {
  const deleteShop = useDeleteShop();

  const handleConfirm = async () => {
    if (!shop) return;
    await deleteShop.mutateAsync(shop.id);
    onOpenChange(false);
    onDeleted?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle className="mt-3">Delete "{shop?.shopName}"?</DialogTitle>
          <DialogDescription>
            This permanently removes the shop and its ledger. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteShop.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteShop.isPending}>
            {deleteShop.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete shop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShopDialog;
