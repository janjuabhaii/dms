import { Pencil, Trash2, ImageOff } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";

const stockBadge = (stock) => {
  if (stock === 0) return <Badge variant="destructive">Out of stock</Badge>;
  if (stock <= 10) return <Badge variant="warning">Low stock · {stock}</Badge>;
  return <Badge variant="success">{stock} in stock</Badge>;
};

const ProductsTable = ({ products, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[72px]">Image</TableHead>
          <TableHead>Product</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product._id}>
            <TableCell>
              {product.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.name}
                  className="h-11 w-11 rounded-lg border border-border object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted">
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium text-foreground">{product.name}</TableCell>
            <TableCell className="hidden max-w-[280px] truncate text-muted-foreground md:table-cell">
              {product.description || "—"}
            </TableCell>
            <TableCell className="text-foreground">{formatCurrency(product.price)}</TableCell>
            <TableCell>{stockBadge(product.stock)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(product)} aria-label="Edit product">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(product)}
                  aria-label="Delete product"
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

export default ProductsTable;
