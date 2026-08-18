import { ImageOff, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";

const ProductCatalogCard = ({ product, index = 0 }) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.productId === product._id);
  const outOfStock = product.stock === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="flex gap-3 border-b border-border p-4"
    >
      {product.image?.url ? (
        <img
          src={product.image.url}
          alt={product.name}
          className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted">
          <ImageOff className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-primary">{formatCurrency(product.price)}</p>
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          {outOfStock ? (
            <Badge variant="destructive">Out of stock</Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
          )}

          {!outOfStock &&
            (cartItem ? (
              <div className="flex items-center rounded-lg border border-input">
                <button
                  type="button"
                  onClick={() => updateQuantity(product._id, cartItem.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="min-w-[2ch] text-center text-xs font-medium text-foreground">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= product.stock}
                  className="flex h-7 w-7 items-center justify-center text-muted-foreground disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <Button size="sm" onClick={() => addItem(product, 1)}>
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCatalogCard;
