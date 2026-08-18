import { Package, ShoppingCart, ClipboardList, User } from "lucide-react";

export const workerNavItems = [
  { label: "Catalog", path: "/worker/products", icon: Package },
  { label: "Cart", path: "/worker/cart", icon: ShoppingCart },
  { label: "Orders", path: "/worker/orders", icon: ClipboardList },
  { label: "Profile", path: "/worker/profile", icon: User },
];
