import { useMemo, useState } from "react";
import { Plus, Search, Users, UserCheck, Percent, Wallet, UsersRound } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/common/StatCard";
import ChartCard from "@/components/common/ChartCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import CardGridSkeleton from "@/components/common/CardGridSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WorkerCard from "@/components/admin/workers/WorkerCard";
import WorkerFormDialog from "@/components/admin/workers/WorkerFormDialog";
import DeleteWorkerDialog from "@/components/admin/workers/DeleteWorkerDialog";
import WorkerPerformanceChart from "@/components/charts/WorkerPerformanceChart";
import { useWorkers } from "@/hooks/useWorkers";
import { useDebounce } from "@/hooks/useDebounce";

const WorkersPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { data: workers, isLoading, isError, error, refetch } = useWorkers(debouncedSearch);

  const [formOpen, setFormOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [deletingWorker, setDeletingWorker] = useState(null);

  const openAddDialog = () => {
    setEditingWorker(null);
    setFormOpen(true);
  };

  const openEditDialog = (worker) => {
    setEditingWorker(worker);
    setFormOpen(true);
  };

  const { stats, chartData } = useMemo(() => {
    if (!workers?.length) {
      return {
        stats: { total: 0, active: 0, avgCommission: 0, totalSales: 0 },
        chartData: [],
      };
    }

    const activeCount = workers.filter((w) => w.isActive).length;
    const avgCommission =
      workers.reduce((sum, w) => sum + (w.commissionPercentage || 0), 0) / workers.length;
    const totalSales = workers.reduce((sum, w) => sum + (w.totalSales || 0), 0);

    const topPerformers = [...workers]
      .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
      .slice(0, 6)
      .map((w) => ({ name: w.name, sales: w.totalSales || 0 }));

    return {
      stats: { total: workers.length, active: activeCount, avgCommission, totalSales },
      chartData: topPerformers,
    };
  }, [workers]);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Workers"
        subtitle="Manage sales workers, their areas, and commission rates."
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add worker
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Workers" icon={Users} value={stats.total} format="number" index={0} />
        <StatCard label="Active Workers" icon={UserCheck} value={stats.active} format="number" index={1} />
        <StatCard
          label="Avg. Commission"
          icon={Percent}
          value={Number(stats.avgCommission.toFixed(1))}
          format="number"
          suffix="%"
          index={2}
        />
        <StatCard label="Total Worker Sales" icon={Wallet} value={stats.totalSales} format="currency" index={3} />
      </div>

      {workers?.length > 0 && (
        <ChartCard title="Top Performers" description="Highest sales this month" delay={0.15}>
          {stats.totalSales > 0 ? (
            <WorkerPerformanceChart data={chartData} />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Performance data will appear here once orders start coming in.
            </p>
          )}
        </ChartCard>
      )}

      <div className="flex items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {workers && (
          <span className="ml-auto text-sm text-muted-foreground">
            {workers.length} worker{workers.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <CardGridSkeleton count={6} />
        </div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : workers?.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={search ? "No workers match your search" : "No workers yet"}
          description={
            search ? "Try a different search term." : "Add your first sales worker to get started."
          }
          action={
            !search && (
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4" />
                Add worker
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workers.map((worker, i) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              index={i}
              onEdit={openEditDialog}
              onDelete={setDeletingWorker}
            />
          ))}
        </div>
      )}

      <WorkerFormDialog open={formOpen} onOpenChange={setFormOpen} worker={editingWorker} />

      <DeleteWorkerDialog
        open={!!deletingWorker}
        onOpenChange={(open) => !open && setDeletingWorker(null)}
        worker={deletingWorker}
      />
    </div>
  );
};

export default WorkersPage;
