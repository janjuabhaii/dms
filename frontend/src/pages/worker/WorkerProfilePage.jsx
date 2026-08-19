import { useNavigate } from "react-router-dom";
import { MapPin, Percent, Package, TrendingUp, Store, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ErrorState from "@/components/common/ErrorState";
import { useAuth } from "@/context/AuthContext";
import { useMyWorkerProfile } from "@/hooks/useWorkers";
import { formatCompactCurrency } from "@/lib/format";

const getInitials = (name = "") =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const WorkerProfilePage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: worker, isLoading, isError, error, refetch } = useMyWorkerProfile();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  // Logout must always work, even if the profile fetch failed — a broken
  // network call is no reason to trap someone in a session they can't leave.
  if (isError) {
    return (
      <div className="space-y-4 p-4">
        <ErrorState message={error?.message} onRetry={refetch} />
        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col items-center rounded-xl border border-border p-6 text-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{getInitials(worker?.name)}</AvatarFallback>
        </Avatar>
        <p className="mt-3 font-display text-base font-semibold text-foreground">{worker?.name}</p>
        <p className="text-sm text-muted-foreground">{worker?.email}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {worker?.area}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Percent className="h-3 w-3" /> {worker?.commissionPercentage}% commission
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border p-3 text-center">
          <Package className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1.5 text-sm font-semibold text-foreground">{worker?.totalOrders}</p>
          <p className="text-[11px] text-muted-foreground">Orders</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-success" />
          <p className="mt-1.5 text-sm font-semibold text-foreground">
            {formatCompactCurrency(worker?.totalSales || 0)}
          </p>
          <p className="text-[11px] text-muted-foreground">Sales</p>
        </div>
        <div className="rounded-xl border border-border p-3 text-center">
          <Store className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1.5 text-sm font-semibold text-foreground">{worker?.assignedShopsCount}</p>
          <p className="text-[11px] text-muted-foreground">Shops</p>
        </div>
      </div>

      <Separator className="my-5" />

      <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};

export default WorkerProfilePage;
