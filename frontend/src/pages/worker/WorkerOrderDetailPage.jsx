import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import { useMyOrder } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/format";
import { STATUS_VARIANT } from "@/lib/orderStatus";

const WorkerOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError } = useMyOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Receipt}
          title="Order not found"
          action={
            <Button variant="outline" onClick={() => navigate("/worker/orders")}>
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link
          to="/worker/orders"
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
          aria-label="Back to orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-base font-semibold text-foreground">
          Order #{order.id.slice(-6).toUpperCase()}
        </h1>
      </div>

      {/* Shop + delivery info */}
      <div className="mb-4 space-y-2.5 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">{order.shop?.shopName}</p>
          <Badge variant={STATUS_VARIANT[order.status] || "default"} className="capitalize">
            {order.status}
          </Badge>
        </div>
        {order.shop?.address && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {order.shop.address}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          Delivery: {new Date(order.deliveryDate).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Line items */}
      <div className="mb-4 rounded-xl border border-border">
        <p className="border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Items
        </p>
        {order.products.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-border px-4 py-3 text-sm last:border-0"
          >
            <div>
              <p className="text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {p.quantity} × {formatCurrency(p.price)}
              </p>
            </div>
            <p className="font-medium text-foreground">{formatCurrency(p.subtotal)}</p>
          </div>
        ))}
      </div>

      {/* Payment summary */}
      <div className="space-y-1.5 rounded-xl border border-border bg-muted/40 p-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Total</span>
          <span className="font-medium text-foreground">{formatCurrency(order.totalAmount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Paid</span>
          <span className="font-medium text-foreground">{formatCurrency(order.paidAmount)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-1.5 font-semibold text-foreground">
          <span>Remaining</span>
          <span>{formatCurrency(order.remainingAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkerOrderDetailPage;
