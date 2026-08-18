import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { workerNavItems } from "@/lib/workerNavConfig";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/common/ThemeToggle";

/**
 * Deliberately NOT the admin Sidebar/Topbar pattern — this is built to feel
 * like a phone app: a fixed top header, scrollable content, and a bottom
 * tab bar (the standard mobile navigation convention workers will already
 * know from every consumer app). The whole shell is capped at max-w-md and
 * centered, so on a desktop browser it reads as "a phone app in a browser"
 * rather than a cramped attempt at a desktop dashboard.
 */
const WorkerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const activeItem = workerNavItems.find((item) => location.pathname.startsWith(item.path));

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen justify-center bg-muted/30">
      <div className="flex w-full max-w-md flex-col bg-background shadow-xl">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur">
          <div>
            <p className="font-display text-sm font-semibold text-foreground">
              {activeItem?.label || "DMS"}
            </p>
            <p className="text-[11px] text-muted-foreground">{user?.name}</p>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Routed page content */}
        <main className="flex-1 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom tab bar */}
        <nav className="fixed bottom-0 z-30 w-full max-w-md border-t border-border bg-background/95 backdrop-blur">
          <div className="grid grid-cols-4">
            {workerNavItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {label === "Cart" && itemCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                {label}
              </NavLink>
            ))}
          </div>
          {/* Safe-area padding for iOS home indicator */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </nav>
      </div>
    </div>
  );
};

export default WorkerLayout;
