import { useState } from "react";
import { Plus, Search, PackageX } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import ProductsTable from "@/components/admin/products/ProductsTable";
import ProductFormDialog from "@/components/admin/products/ProductFormDialog";
import DeleteProductDialog from "@/components/admin/products/DeleteProductDialog";
import { useProducts } from "@/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";

const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data: products, isLoading, isError, error, refetch } = useProducts(debouncedSearch);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog, pricing, and stock levels."
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {products && (
              <span className="ml-auto text-sm text-muted-foreground">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoading ? (
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
                <TableSkeleton rows={6} columns={6} />
              </TableBody>
            </Table>
          ) : isError ? (
            <div className="p-6">
              <ErrorState message={error?.message} onRetry={refetch} />
            </div>
          ) : products?.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={PackageX}
                title={search ? "No products match your search" : "No products yet"}
                description={
                  search
                    ? "Try a different search term."
                    : "Add your first product to start building your catalog."
                }
                action={
                  !search && (
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4" />
                      Add product
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <ProductsTable products={products} onEdit={openEditDialog} onDelete={setDeletingProduct} />
          )}
        </CardContent>
      </Card>

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} />

      <DeleteProductDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
      />
    </div>
  );
};

export default ProductsPage;
