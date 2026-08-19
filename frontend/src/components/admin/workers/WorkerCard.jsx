import { motion } from "framer-motion";
import { MapPin, Percent, Pencil, Trash2, TrendingUp, Package } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCompactCurrency } from "@/lib/format";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const WorkerCard = ({ worker, onEdit, onDelete, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card className="h-full border-border/60">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="text-sm">{getInitials(worker.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{worker.name}</p>
                <p className="truncate text-xs text-muted-foreground">{worker.email}</p>
              </div>
            </div>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                worker.isActive ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", worker.isActive ? "bg-success" : "bg-muted-foreground")} />
              {worker.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1 font-normal">
              <MapPin className="h-3 w-3" />
              {worker.area}
            </Badge>
            <Badge variant="outline" className="gap-1 font-normal">
              <Percent className="h-3 w-3" />
              {worker.commissionPercentage}% commission
            </Badge>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{worker.totalOrders}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formatCompactCurrency(worker.totalSales)}</p>
                <p className="text-xs text-muted-foreground">Total sales</p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-end gap-1 pt-4">
            <Button variant="ghost" size="icon" onClick={() => onEdit(worker)} aria-label="Edit worker">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(worker)}
              aria-label="Delete worker"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkerCard;
