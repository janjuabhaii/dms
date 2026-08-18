import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";

const statusVariant = {
  Paid: "success",
  Pending: "warning",
  Partial: "secondary",
};

const RecentOrdersTable = ({ orders }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Shop</TableHead>
          <TableHead className="hidden sm:table-cell">Worker</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-foreground">{order.id}</TableCell>
            <TableCell className="text-muted-foreground">{order.shop}</TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{order.worker}</TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{order.date}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-medium text-foreground">
              {formatCurrency(order.amount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default RecentOrdersTable;
