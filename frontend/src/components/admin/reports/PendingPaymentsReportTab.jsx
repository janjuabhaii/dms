import { Clock, CheckCircle2 } from "lucide-react";

import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import ExportButton from "./ExportButton";
import { usePendingPaymentsReport } from "@/hooks/useReports";
import { formatCurrency } from "@/lib/format";

const CSV_COLUMNS = [
  { label: "Shop", accessor: (r) => r.shopName },
  { label: "Owner", accessor: (r) => r.ownerName },
  { label: "Phone", accessor: (r) => r.phone },
  { label: "Worker", accessor: (r) => r.workerName },
  { label: "Total Purchase", accessor: (r) => r.totalPurchase },
  { label: "Paid", accessor: (r) => r.paidAmount },
  { label: "Pending", accessor: (r) => r.pendingAmount },
];

const PendingPaymentsReportTab = () => {
  const { data, isLoading, isError, error, refetch } = usePendingPaymentsReport();

  if (isError) {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid max-w-xs grid-cols-1">
          <StatCard label="Total Pending" icon={Clock} value={data?.totalPending || 0} format="currency" index={0} />
        </div>
        <ExportButton filename="pending-payments-report" rows={data?.rows} columns={CSV_COLUMNS} />
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.rows?.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={CheckCircle2}
                title="No outstanding payments"
                description="Every shop is fully settled right now."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead className="hidden sm:table-cell">Worker</TableHead>
                  <TableHead className="text-right">Total Purchase</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">
                      {r.shopName}
                      <p className="text-xs font-normal text-muted-foreground">{r.ownerName}</p>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{r.workerName}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(r.totalPurchase)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(r.paidAmount)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-warning">
                      {formatCurrency(r.pendingAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingPaymentsReportTab;
