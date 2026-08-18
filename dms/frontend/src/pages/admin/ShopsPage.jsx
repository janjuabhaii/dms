import { useState } from "react";
import { Plus, Search, Store } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import TableSkeleton from "@/components/common/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import ShopsTable from "@/components/admin/shops/ShopsTable";
import ShopFormDialog from "@/components/admin/shops/ShopFormDialog";
import DeleteShopDialog from "@/components/admin/shops/DeleteShopDialog";
import { useShops } from "@/hooks/useShops";
import { useDebounce } from "@/hooks/useDebounce";

const ShopsPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data: shops, isLoading, isError, error, refetch } = useShops(debouncedSearch);

  const [formOpen, setFormOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [deletingShop, setDeletingShop] = useState(null);

  const openAddDialog = () => {
    setEditingShop(null);
    setFormOpen(true);
  };

  const openEditDialog = (shop) => {
    setEditingShop(shop);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Shops"
        subtitle="View shop profiles, purchase history, and pending balances."
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add shop
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search shops, owners, addresses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {shops && (
              <span className="ml-auto text-sm text-muted-foreground">
                {shops.length} shop{shops.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoading ? (
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
                <TableSkeleton rows={6} columns={6} />
              </TableBody>
            </Table>
          ) : isError ? (
            <div className="p-6">
              <ErrorState message={error?.message} onRetry={refetch} />
            </div>
          ) : shops?.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Store}
                title={search ? "No shops match your search" : "No shops yet"}
                description={
                  search ? "Try a different search term." : "Add your first shop to start tracking sales."
                }
                action={
                  !search && (
                    <Button onClick={openAddDialog}>
                      <Plus className="h-4 w-4" />
                      Add shop
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <ShopsTable shops={shops} onEdit={openEditDialog} onDelete={setDeletingShop} />
          )}
        </CardContent>
      </Card>

      <ShopFormDialog open={formOpen} onOpenChange={setFormOpen} shop={editingShop} />

      <DeleteShopDialog
        open={!!deletingShop}
        onOpenChange={(open) => !open && setDeletingShop(null)}
        shop={deletingShop}
      />
    </div>
  );
};

export default ShopsPage;
