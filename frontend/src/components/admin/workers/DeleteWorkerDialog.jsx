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
import { useDeleteWorker } from "@/hooks/useWorkers";

const DeleteWorkerDialog = ({ open, onOpenChange, worker }) => {
  const deleteWorker = useDeleteWorker();

  const handleConfirm = async () => {
    if (!worker) return;
    await deleteWorker.mutateAsync(worker.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
            <TriangleAlert className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle className="mt-3">Remove "{worker?.name}"?</DialogTitle>
          <DialogDescription>
            This deletes their login account and business profile permanently. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteWorker.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteWorker.isPending}>
            {deleteWorker.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Remove worker
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWorkerDialog;
