import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_KEY = "dms_worker_cart";

/**
 * Cart state for the worker's in-progress order. Lives entirely client-side
 * until "Place order" is tapped — there's no server-side draft-order concept,
 * which keeps this simple and means an abandoned cart never shows up as a
 * phantom order anywhere.
 *
 * Persisted to localStorage so switching tabs, losing signal mid-visit to a
 * shop, or accidentally closing the browser doesn't lose a half-built order —
 * a real concern for a field sales app.
 */
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      const maxQty = product.stock;

      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxQty);
        return prev.map((i) => (i.productId === product._id ? { ...i, quantity: nextQty } : i));
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.image?.url,
          price: product.price,
          stock: product.stock,
          quantity: Math.min(quantity, maxQty),
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
      );
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const { itemCount, subtotal } = useMemo(
    () => ({
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    [items]
  );

  const value = { items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
