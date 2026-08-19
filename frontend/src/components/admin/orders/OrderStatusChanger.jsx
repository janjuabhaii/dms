import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_VARIANT, ALLOWED_TRANSITIONS } from "@/lib/orderStatus";
import { useUpdateOrderStatus } from "@/hooks/useOrders";

const OrderStatusChanger = ({ order }) => {
  const updateStatus = useUpdateOrderStatus();
  const nextOptions = ALLOWED_TRANSITIONS[order.status] || [];
  const isTerminal = nextOptions.length === 0;

  if (isTerminal) {
    return (
      <Badge variant={STATUS_VARIANT[order.status]} className="px-3 py-1.5 text-sm capitalize">
        {order.status}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={STATUS_VARIANT[order.status]} className="px-3 py-1.5 text-sm capitalize">
        {order.status}
      </Badge>
      <Select
        value=""
        onValueChange={(status) => updateStatus.mutate({ id: order.id, status })}
        disabled={updateStatus.isPending}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          {updateStatus.isPending ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Updating...
            </span>
          ) : (
            <SelectValue placeholder="Move to..." />
          )}
        </SelectTrigger>
        <SelectContent>
          {nextOptions.map((status) => (
            <SelectItem key={status} value={status}>
              Mark as {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrderStatusChanger;
