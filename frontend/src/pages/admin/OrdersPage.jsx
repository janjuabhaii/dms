import { useMemo, useState } from "react";
import { Search, ClipboardList, Wallet, Clock, PackageCheck } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import TableSkeleton from "@/components/common/TableSkeleton";
import StatCard from "@/components/common/StatCard";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { useAllOrders } from "@/hooks/useOrders";
import { useDebounce } from "@/hooks/useDebounce";
import { STATUS_LABELS } from "@/lib/orderStatus";

const OrdersPage = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const debouncedSearch = useDebounce(search, 350);

  const params = useMemo(() => {
    const p = {};
    if (debouncedSearch) p.search = debouncedSearch;
    if (status !== "all") p.status = status;
    return p;
  }, [debouncedSearch, status]);

  const { data: orders, isLoading, isError, error, refetch } = useAllOrders(params);

  const stats = useMemo(() => {
    if (!orders) return { total: 0, pending: 0, totalValue: 0, pendingAmount: 0 };
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      pendingAmount: orders.reduce((sum, o) => sum + o.remainingAmount, 0),
    };
  }, [orders]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader title="Orders" subtitle="Track every order submitted by your sales workers." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" icon={ClipboardList} value={stats.total} format="number" index={0} />
        <StatCard label="Pending Orders" icon={Clock} value={stats.pending} format="number" index={1} />
        <StatCard label="Total Value" icon={Wallet} value={stats.totalValue} format="currency" index={2} />
        <StatCard label="Pending Payments" icon={PackageCheck} value={stats.pendingAmount} format="currency" index={3} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by shop or worker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {orders && (
              <span className="text-sm text-muted-foreground sm:ml-auto">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {isLoading ? (
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
                <TableSkeleton rows={6} columns={7} />
              </TableBody>
            </Table>
          ) : isError ? (
            <div className="p-6">
              <ErrorState message={error?.message} onRetry={refetch} />
            </div>
          ) : orders?.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardList}
                title={search || status !== "all" ? "No orders match your filters" : "No orders yet"}
                description={
                  search || status !== "all"
                    ? "Try a different search term or status."
                    : "Orders submitted by workers will show up here."
                }
              />
            </div>
          ) : (
            <OrdersTable orders={orders} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
