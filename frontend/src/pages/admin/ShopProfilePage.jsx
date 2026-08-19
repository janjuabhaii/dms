import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Wallet,
  CheckCircle2,
  Clock,
  Store,
  Mail,
  Percent,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import StatCard from "@/components/common/StatCard";
import EmptyState from "@/components/common/EmptyState";
import ShopFormDialog from "@/components/admin/shops/ShopFormDialog";
import DeleteShopDialog from "@/components/admin/shops/DeleteShopDialog";
import { useShop } from "@/hooks/useShops";
import { formatCurrency } from "@/lib/format";
import { STATUS_VARIANT } from "@/lib/orderStatus";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const ShopProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: shop, isLoading, isError, error } = useShop(id);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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

  if (isError || !shop) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={Store}
          title="Shop not found"
          description={error?.message || "This shop may have been deleted."}
          action={
            <Button variant="outline" onClick={() => navigate("/admin/shops")}>
              <ArrowLeft className="h-4 w-4" />
              Back to shops
            </Button>
          }
        />
      </div>
    );
  }

  const worker = shop.assignedWorker;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/shops" aria-label="Back to shops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {shop.shopName}
            </h1>
            <p className="text-sm text-muted-foreground">Owned by {shop.ownerName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Purchases" icon={Wallet} value={shop.totalPurchase} format="currency" index={0} />
        <StatCard label="Paid Amount" icon={CheckCircle2} value={shop.paidAmount} format="currency" index={1} />
        <StatCard label="Pending Amount" icon={Clock} value={shop.pendingAmount} format="currency" index={2} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Shop information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm text-foreground">{shop.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:col-span-1">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm text-foreground">{shop.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="text-sm text-foreground">{shop.ownerName}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Customer since</p>
                <p className="text-sm text-foreground">
                  {new Date(shop.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Assigned worker</CardTitle>
          </CardHeader>
          <CardContent>
            {worker ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{getInitials(worker.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{worker.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{worker.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {worker.area}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Percent className="h-3.5 w-3.5" /> {worker.commissionPercentage}% commission
                  </div>
                  {worker.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" /> {worker.phone}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No worker assigned.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Order history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {shop.orderHistory?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead className="hidden sm:table-cell">Worker</TableHead>
                  <TableHead className="hidden md:table-cell">Delivery Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shop.orderHistory.map((order) => (
                  <TableRow
                    key={order.id}
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-mono text-xs text-foreground">
                      #{order.id.slice(-6).toUpperCase()}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {order.workerName}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[order.status] || "default"} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell className="text-right text-foreground">
                      {formatCurrency(order.remainingAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Wallet}
                title="No orders yet"
                description="Orders placed by the assigned worker for this shop will show up here."
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ShopFormDialog open={editOpen} onOpenChange={setEditOpen} shop={shop} />
      <DeleteShopDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        shop={shop}
        onDeleted={() => navigate("/admin/shops")}
      />
    </div>
  );
};

export default ShopProfilePage;
