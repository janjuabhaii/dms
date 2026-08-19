import { useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { useMyOrders } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/format";
import { STATUS_VARIANT } from "@/lib/orderStatus";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const WorkerOrdersPage = () => {
  const [status, setStatus] = useState("");
  const { data: orders, isLoading, isError, error, refetch } = useMyOrders(status ? { status } : {});

  return (
    <div>
      <div className="sticky top-14 z-20 flex gap-2 overflow-x-auto border-b border-border bg-background/95 p-3 backdrop-blur">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              status === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6">
          <ErrorState message={error?.message} onRetry={refetch} />
        </div>
      ) : orders?.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={ClipboardList}
            title="No orders yet"
            description="Orders you submit will show up here."
          />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/worker/orders/${order.id}`}
              className="flex items-center justify-between gap-3 p-4 active:bg-accent/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{order.shop?.shopName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {order.products.length} item{order.products.length !== 1 ? "s" : ""}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[order.status] || "default"} className="capitalize">
                    {order.status}
                  </Badge>
                  {order.remainingAmount > 0 && (
                    <span className="text-xs text-warning">
                      {formatCurrency(order.remainingAmount)} due
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerOrdersPage;
