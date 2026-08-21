import { useState } from "react";

import ChartCard from "@/components/common/ChartCard";
import ErrorState from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import WorkerPerformanceChart from "@/components/charts/WorkerPerformanceChart";
import DateRangeFilter from "./DateRangeFilter";
import ExportButton from "./ExportButton";
import { useWorkerPerformanceReport } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/format";

const toISODate = (date) => date.toISOString().split("T")[0];
const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toISODate(d);
};

const CSV_COLUMNS = [
  { label: "Worker", accessor: (r) => r.name },
  { label: "Area", accessor: (r) => r.area },
  { label: "Orders", accessor: (r) => r.totalOrders },
  { label: "Sales", accessor: (r) => r.totalSales },
  { label: "Commission Earned", accessor: (r) => r.commissionEarned },
];

const WorkerPerformanceReportTab = () => {
  const [range, setRange] = useState({ from: defaultFrom(), to: toISODate(new Date()) });
  const { data, isLoading, isError, error, refetch } = useWorkerPerformanceReport(range);

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  const chartData = (data?.rows || []).slice(0, 8).map((r) => ({ name: r.name, sales: r.totalSales }));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <ExportButton filename="worker-performance-report" rows={data?.rows} columns={CSV_COLUMNS} />
      </div>

      <ChartCard title="Sales by Worker" description="Ranked highest to lowest in the selected period">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : chartData.every((c) => c.sales === 0) ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No sales recorded in this range.</p>
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
                  <TableCell className="text-right text-muted-foreground">{r.totalOrders}</TableCell>
                  <TableCell className="text-right text-foreground">{formatCurrency(r.totalSales)}</TableCell>
                  <TableCell className="text-right text-foreground">
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

export default WorkerPerformanceReportTab;
