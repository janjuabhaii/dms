import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Loader2, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import CartItemRow from "@/components/worker/CartItemRow";
import { useCart } from "@/context/CartContext";
import { useShops } from "@/hooks/useShops";
import { useCreateOrder } from "@/hooks/useOrders";
import { formatCurrency } from "@/lib/format";

const todayISO = () => new Date().toISOString().split("T")[0];

/**
 * The order form itself: Shop selection, Products (from the cart), Quantity
 * (already set in the cart), Delivery date, Paid amount, Remaining amount —
 * every field the required "Order form" spec asks for, in one screen.
 *
 * `useShops()` here is the exact same hook Phase 6 built for the admin Shops
 * page — the backend already scopes GET /shops to "my assigned shops only"
 * for a worker role, so no new API surface was needed for shop selection.
 */
const WorkerCartPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const {
    data: shops,
    isLoading: shopsLoading,
    isError: shopsError,
    error: shopsErrorObj,
    refetch: refetchShops,
  } = useShops();
  const createOrder = useCreateOrder();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { shopId: "", deliveryDate: todayISO(), paidAmount: "" },
  });

  const paidAmount = Number(watch("paidAmount")) || 0;
  const remainingAmount = useMemo(() => Math.max(subtotal - paidAmount, 0), [subtotal, paidAmount]);
  const overpaid = paidAmount > subtotal;

  const onSubmit = async (values) => {
    const result = await createOrder.mutateAsync({
      shopId: values.shopId,
      deliveryDate: values.deliveryDate,
      paidAmount: Number(values.paidAmount) || 0,
      products: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    clearCart();
    navigate(`/worker/orders/${result.data.id}`, { replace: true });
  };

  if (items.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add products from the catalog to start building an order."
          action={
            <Button onClick={() => navigate("/worker/products")}>Browse products</Button>
          }
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Cart items */}
      <div>
        {items.map((item) => (
          <CartItemRow key={item.productId} item={item} />
        ))}
      </div>

      {/* Order form */}
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="shopId">Shop</Label>
          {shopsLoading ? (
            <p className="text-xs text-muted-foreground">Loading your shops...</p>
          ) : shopsError ? (
            <ErrorState message={shopsErrorObj?.message} onRetry={refetchShops} />
          ) : shops?.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
              <Store className="mb-1 h-4 w-4" />
              No shops are assigned to you yet. Contact your admin.
            </div>
          ) : (
            <Controller
              name="shopId"
              control={control}
              rules={{ required: "Select a shop" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="shopId" aria-invalid={!!errors.shopId}>
                    <SelectValue placeholder="Select a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    {shops.map((shop) => (
                      <SelectItem key={shop.id} value={shop.id}>
                        {shop.shopName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {errors.shopId && <p className="text-xs text-destructive">{errors.shopId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryDate">Delivery date</Label>
          <Input
            id="deliveryDate"
            type="date"
            min={todayISO()}
            aria-invalid={!!errors.deliveryDate}
            {...register("deliveryDate", { required: "Delivery date is required" })}
          />
          {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidAmount">Paid amount</Label>
          <Input
            id="paidAmount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            aria-invalid={!!errors.paidAmount || overpaid}
            {...register("paidAmount", {
              min: { value: 0, message: "Cannot be negative" },
            })}
          />
          {overpaid && <p className="text-xs text-destructive">Cannot exceed the order total.</p>}
        </div>

        {/* Summary */}
        <div className="space-y-1.5 rounded-lg border border-border bg-muted/40 p-3.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Order total</span>
            <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Paid</span>
            <span className="font-medium text-foreground">{formatCurrency(paidAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1.5 font-medium text-foreground">
            <span>Remaining</span>
            <span>{formatCurrency(remainingAmount)}</span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={createOrder.isPending || overpaid || !shops?.length || shopsError}
        >
          {createOrder.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Place order
        </Button>
      </div>
    </form>
  );
};

export default WorkerCartPage;
