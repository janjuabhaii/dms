import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, MapPin } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/format";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ShopsTable = ({ shops, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shop</TableHead>
          <TableHead className="hidden md:table-cell">Assigned Worker</TableHead>
          <TableHead className="hidden lg:table-cell">Phone</TableHead>
          <TableHead>Total Purchase</TableHead>
          <TableHead>Pending</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shops.map((shop) => (
          <TableRow key={shop.id} className="cursor-pointer" onClick={() => navigate(`/admin/shops/${shop.id}`)}>
            <TableCell>
              <p className="font-medium text-foreground">{shop.shopName}</p>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {shop.ownerName}
              </p>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {shop.assignedWorker ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">{getInitials(shop.assignedWorker.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{shop.assignedWorker.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">{shop.phone}</TableCell>
            <TableCell className="text-foreground">{formatCurrency(shop.totalPurchase)}</TableCell>
            <TableCell>
              {shop.pendingAmount > 0 ? (
                <Badge variant="warning">{formatCurrency(shop.pendingAmount)}</Badge>
              ) : (
                <Badge variant="success">Settled</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" onClick={() => onEdit(shop)} aria-label="Edit shop">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(shop)}
                  aria-label="Delete shop"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ShopsTable;
