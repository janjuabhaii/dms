import { useState } from "react";
import { Wallet, ShoppingCart, TrendingUp, Clock } from "lucide-react";

import StatCard from "@/components/common/StatCard";
import ChartCard from "@/components/common/ChartCard";
import ErrorState from "@/components/common/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import SalesTrendChart from "@/components/charts/SalesTrendChart";
import DateRangeFilter from "./DateRangeFilter";
import ExportButton from "./ExportButton";
import { useSalesReport } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/format";

const toISODate = (date) => date.toISOString().split("T")[0];
const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toISODate(d);
};

const CSV_COLUMNS = [
  { label: "Date", accessor: (r) => r.date },
  { label: "Total Sales", accessor: (r) => r.totalSales },
  { label: "Order Count", accessor: (r) => r.orderCount },
];

const SalesReportTab = () => {
  const [range, setRange] = useState({ from: defaultFrom(), to: toISODate(new Date()) });
  const { data, isLoading, isError, error, refetch } = useSalesReport(range);

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  const summary = data?.summary || { totalSales: 0, totalOrders: 0, totalPaid: 0, totalPending: 0 };
  const avgOrderValue = summary.totalOrders > 0 ? summary.totalSales / summary.totalOrders : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <DateRangeFilter from={range.from} to={range.to} onChange={setRange} />
        <ExportButton filename="sales-report" rows={data?.series} columns={CSV_COLUMNS} />
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Sales" icon={Wallet} value={summary.totalSales} format="currency" index={0} />
          <StatCard label="Total Orders" icon={ShoppingCart} value={summary.totalOrders} format="number" index={1} />
          <StatCard label="Avg. Order Value" icon={TrendingUp} value={avgOrderValue} format="currency" index={2} />
          <StatCard label="Pending Payments" icon={Clock} value={summary.totalPending} format="currency" index={3} />
        </div>
      )}

      <ChartCard title="Sales Trend" description="Revenue over the selected period">
        {isLoading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : data?.series?.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No orders in this date range.
          </p>
        ) : (
          <SalesTrendChart data={data.series} />
        )}
      </ChartCard>

      <p className="text-right text-xs text-muted-foreground">
        Total paid in range: {formatCurrency(summary.totalPaid)}
      </p>
    </div>
  );
};

export default SalesReportTab;
