import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Wallet, CheckCircle2, Clock, Percent, Receipt } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import OrderStatusChanger from "@/components/admin/orders/OrderStatusChanger";
import { useOrder } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/format";

const getInitials = (name = "") =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

/**
 * The admin-facing order detail view — worker, shop, products, payment,
 * and delivery date all in one place, plus the status changer that drives
 * the pending → confirmed → delivered / cancelled lifecycle.
 */
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, isError, error } = useOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={Receipt}
          title="Order not found"
          description={error?.message || "This order may have been removed."}
          action={
            <Button variant="outline" onClick={() => navigate("/admin/orders")}>
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/orders" aria-label="Back to orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Order #{order.id.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-muted-foreground">
              Placed{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <OrderStatusChanger order={order} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Order Total" icon={Wallet} value={order.totalAmount} format="currency" index={0} />
        <StatCard label="Paid Amount" icon={CheckCircle2} value={order.paidAmount} format="currency" index={1} />
        <StatCard label="Remaining" icon={Clock} value={order.remainingAmount} format="currency" index={2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Worker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarFallback>{getInitials(order.worker?.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{order.worker?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{order.worker?.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {order.worker?.area}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold text-foreground">{order.shop?.shopName}</p>
            {order.shop?.address && (
              <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {order.shop.address}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Delivery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(order.deliveryDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Percent className="h-3.5 w-3.5" />
              {order.totalAmount > 0 ? ((order.paidAmount / order.totalAmount) * 100).toFixed(0) : 0}% paid
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.products.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(p.price)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.quantity}</TableCell>
                  <TableCell className="text-right text-foreground">{formatCurrency(p.subtotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetailPage;
