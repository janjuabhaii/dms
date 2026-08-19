import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { STATUS_VARIANT } from "@/lib/orderStatus";

const OrdersTable = ({ orders }) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shop</TableHead>
          <TableHead className="hidden md:table-cell">Worker</TableHead>
          <TableHead className="hidden lg:table-cell">Delivery Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className="hidden sm:table-cell">Remaining</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow
            key={order.id}
            onClick={() => navigate(`/admin/orders/${order.id}`)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium text-foreground">{order.shop?.shopName}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{order.worker?.name}</TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">
              {new Date(order.deliveryDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[order.status] || "default"} className="capitalize">
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-foreground">{formatCurrency(order.totalAmount)}</TableCell>
            <TableCell className="hidden sm:table-cell">
              {order.remainingAmount > 0 ? (
                <span className="text-warning">{formatCurrency(order.remainingAmount)}</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrdersTable;
