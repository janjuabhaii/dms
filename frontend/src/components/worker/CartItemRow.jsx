import { ImageOff, Trash2 } from "lucide-react";
import QuantityStepper from "./QuantityStepper";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/CartContext";

const CartItemRow = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-3 border-b border-border p-4">
      {item.image ? (
        <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover" />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          <ImageOff className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <button
            onClick={() => removeItem(item.productId)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper
            quantity={item.quantity}
            max={item.stock}
            onChange={(q) => updateQuantity(item.productId, q)}
            size="sm"
          />
          <p className="text-sm font-semibold text-foreground">{formatCurrency(item.price * item.quantity)}</p>
        </div>
      </div>
    </div>
  );
};

export default CartItemRow;
