import ChartCard from "@/components/common/ChartCard";
import ErrorState from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import WorkerPerformanceChart from "@/components/charts/WorkerPerformanceChart";
import ExportButton from "./ExportButton";
import { useShopPurchaseHistoryReport } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/format";

const CSV_COLUMNS = [
  { label: "Shop", accessor: (r) => r.shopName },
  { label: "Owner", accessor: (r) => r.ownerName },
  { label: "Worker", accessor: (r) => r.workerName },
  { label: "Orders", accessor: (r) => r.orderCount },
  { label: "Total Purchase", accessor: (r) => r.totalPurchase },
  { label: "Paid", accessor: (r) => r.paidAmount },
  { label: "Pending", accessor: (r) => r.pendingAmount },
];

const ShopPurchaseHistoryReportTab = () => {
  const { data, isLoading, isError, error, refetch } = useShopPurchaseHistoryReport();

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  // Reuses WorkerPerformanceChart (a generic ranked horizontal bar chart) —
  // it only ever needed {name, sales}-shaped data, so it works equally well
  // ranking shops by total purchase as it does ranking workers by sales.
  const chartData = (data?.rows || [])
    .slice(0, 8)
    .map((r) => ({ name: r.shopName, sales: r.totalPurchase }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ExportButton filename="shop-purchase-history" rows={data?.rows} columns={CSV_COLUMNS} />
      </div>

      <ChartCard title="Top Shops by Purchase Volume" description="All-time totals">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No shops yet.</p>
        ) : (
          <WorkerPerformanceChart data={chartData} />
        )}
      </ChartCard>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop</TableHead>
                <TableHead className="hidden sm:table-cell">Worker</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total Purchase</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.rows || []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">
                    {r.shopName}
                    <p className="text-xs font-normal text-muted-foreground">{r.ownerName}</p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{r.workerName}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{r.orderCount}</TableCell>
                  <TableCell className="text-right text-foreground">{formatCurrency(r.totalPurchase)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(r.paidAmount)}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {r.pendingAmount > 0 ? (
                      <span className="text-warning">{formatCurrency(r.pendingAmount)}</span>
                    ) : (
                      formatCurrency(0)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopPurchaseHistoryReportTab;
