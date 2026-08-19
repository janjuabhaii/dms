import { Printer } from "lucide-react";

import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SalesReportTab from "@/components/admin/reports/SalesReportTab";
import WorkerPerformanceReportTab from "@/components/admin/reports/WorkerPerformanceReportTab";
import PendingPaymentsReportTab from "@/components/admin/reports/PendingPaymentsReportTab";
import ShopPurchaseHistoryReportTab from "@/components/admin/reports/ShopPurchaseHistoryReportTab";
import CommissionReportTab from "@/components/admin/reports/CommissionReportTab";

/**
 * Every tab is its own React Query hook, so switching tabs doesn't refetch
 * data that's already cached, and each report loads independently rather
 * than blocking on the others.
 */
const ReportsPage = () => {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 print:p-0">
      <PageHeader
        title="Reports"
        subtitle="Sales, performance, and payment analytics across your business."
        actions={
          <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        }
      />

      <Tabs defaultValue="sales">
        <TabsList className="print:hidden">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="workers">Worker Performance</TabsTrigger>
          <TabsTrigger value="pending">Pending Payments</TabsTrigger>
          <TabsTrigger value="shops">Shop Purchases</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReportTab />
        </TabsContent>
        <TabsContent value="workers">
          <WorkerPerformanceReportTab />
        </TabsContent>
        <TabsContent value="pending">
          <PendingPaymentsReportTab />
        </TabsContent>
        <TabsContent value="shops">
          <ShopPurchaseHistoryReportTab />
        </TabsContent>
        <TabsContent value="commissions">
          <CommissionReportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
