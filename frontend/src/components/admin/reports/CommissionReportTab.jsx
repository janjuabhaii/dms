import { Percent } from "lucide-react";

import StatCard from "@/components/common/StatCard";
import ChartCard from "@/components/common/ChartCard";
import ErrorState from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import WorkerPerformanceChart from "@/components/charts/WorkerPerformanceChart";
import ExportButton from "./ExportButton";
import { useCommissionReport } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/format";

const CSV_COLUMNS = [
  { label: "Worker", accessor: (r) => r.name },
  { label: "Area", accessor: (r) => r.area },
  { label: "Commission %", accessor: (r) => r.commissionPercentage },
  { label: "Orders", accessor: (r) => r.totalOrders },
  { label: "Sales", accessor: (r) => r.totalSales },
  { label: "Commission Earned", accessor: (r) => r.commissionEarned },
];

/**
 * Reads Worker.totalCommissionEarned directly (see report.controller.js) —
 * an exactly-maintained running total, not recomputed here, so this report
 * is guaranteed consistent with what order creation/cancellation produced.
 */
const CommissionReportTab = () => {
  const { data, isLoading, isError, error, refetch } = useCommissionReport();

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  const chartData = (data?.rows || [])
    .slice(0, 8)
    .map((r) => ({ name: r.name, sales: r.commissionEarned }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid max-w-xs grid-cols-1">
          <StatCard
            label="Total Commission Payable"
            icon={Percent}
            value={data?.totalCommission || 0}
            format="currency"
            index={0}
          />
        </div>
        <ExportButton filename="commission-report" rows={data?.rows} columns={CSV_COLUMNS} />
      </div>

      <ChartCard title="Commission by Worker" description="All-time earned commission">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : chartData.every((c) => c.sales === 0) ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No commission earned yet.</p>
        ) : (
          <WorkerPerformanceChart data={chartData} />
        )}
      </ChartCard>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead className="hidden sm:table-cell">Area</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.rows || []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-foreground">{r.name}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{r.area}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{r.commissionPercentage}%</TableCell>
                  <TableCell className="text-right text-muted-foreground">{r.totalOrders}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(r.totalSales)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-foreground">
                    {formatCurrency(r.commissionEarned)}
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

export default CommissionReportTab;
