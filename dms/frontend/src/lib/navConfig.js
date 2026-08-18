import {
  LayoutDashboard,
  Package,
  Users,
  Store,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";

/**
 * Single source of truth for the Admin sidebar. Adding a new section later
 * (Phase 4+) means adding one entry here — Sidebar.jsx, Topbar's breadcrumb,
 * and route protection all read from this array.
 */
export const adminNavItems = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Workers", path: "/admin/workers", icon: Users },
  { label: "Shops", path: "/admin/shops", icon: Store },
  { label: "Orders", path: "/admin/orders", icon: ClipboardList },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];
