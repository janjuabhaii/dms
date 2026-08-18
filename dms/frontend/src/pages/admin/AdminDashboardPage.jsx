import { Package, Users, Store, Wallet, Clock } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import ChartCard from "@/components/common/ChartCard";
import RecentOrdersTable from "@/components/common/RecentOrdersTable";
import { Skeleton } from "@/components/ui/skeleton";
import MonthlySalesChart from "@/components/charts/MonthlySalesChart";
import PaymentOverviewChart from "@/components/charts/PaymentOverviewChart";
import WorkerPerformanceChart from "@/components/charts/WorkerPerformanceChart";
import { useDashboardSummary } from "@/hooks/useReports";

/**
 * Phase 3 built this UI against mock data (src/lib/mockData.js), by design —
 * every component here (StatCard, ChartCard, the chart components,
 * RecentOrdersTable) took plain props/arrays specifically so the data
 * source could be swapped later without touching structure. Phase 10 is
 * that swap: GET /reports/dashboard-summary returns exactly this shape.
 */
const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { data, isLoading, isError, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Skeleton className="h-80 w-full xl:col-span-2" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-sm text-destructive">
          Couldn't load the dashboard: {error?.message || "Something went wrong."}
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Total Products", icon: Package, format: "number", ...data.stats.totalProducts },
    { label: "Total Workers", icon: Users, format: "number", ...data.stats.totalWorkers },
    { label: "Total Shops", icon: Store, format: "number", ...data.stats.totalShops },
    { label: "Total Sales", icon: Wallet, format: "currency", ...data.stats.totalSales },
    { label: "Pending Payments", icon: Clock, format: "currency", ...data.stats.pendingPayments },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "there"}`}
        subtitle="Here's what's happening across your distribution network today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} index={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Monthly Sales"
          description="Revenue trend across the last 12 months"
          className="xl:col-span-2"
          delay={0.15}
        >
          <MonthlySalesChart data={data.monthlySales} />
        </ChartCard>

        <ChartCard title="Payment Overview" description="Paid vs. pending vs. overdue" delay={0.2}>
          <PaymentOverviewChart data={data.paymentOverview} />
        </ChartCard>
      </div>

      <ChartCard title="Worker Performance" description="Top workers by all-time sales" delay={0.25}>
        {data.workerPerformance.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No workers yet.</p>
        ) : (
          <WorkerPerformanceChart data={data.workerPerformance} />
        )}
      </ChartCard>

      <ChartCard title="Recent Orders" description="Latest activity across all shops" delay={0.3}>
        {data.recentOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <RecentOrdersTable orders={data.recentOrders} />
        )}
      </ChartCard>
    </div>
  );
};

export default AdminDashboardPage;
