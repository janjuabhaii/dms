import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Boxes, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared inner content for both the desktop rail and the mobile drawer, so
 * nav items, active-state styling, and the brand mark only exist in one place.
 */
const SidebarNav = ({ navItems, collapsed, onNavigate }) => (
  <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
    {navItems.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
          )
        }
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span
          className={cn(
            "overflow-hidden whitespace-nowrap transition-all duration-200",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          {label}
        </span>
      </NavLink>
    ))}
  </nav>
);

const BrandMark = ({ collapsed }) => (
  <div className="flex items-center gap-2.5 overflow-hidden">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
      <Boxes className="h-5 w-5 text-primary" />
    </div>
    <span
      className={cn(
        "font-display text-lg font-semibold tracking-tight text-sidebar-foreground transition-all duration-200 whitespace-nowrap",
        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
      )}
    >
      DMS
    </span>
  </div>
);

/**
 * Desktop: a persistent rail that can collapse to icon-only (width transition,
 * no unmount — state and scroll position are preserved).
 * Mobile (< lg): hidden entirely; a separate animated drawer (below) takes over,
 * triggered by the hamburger button in Topbar.
 */
const Sidebar = ({ navItems, collapsed, onToggleCollapse, mobileOpen, onMobileClose }) => {
  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-in-out lg:flex print:hidden",
          collapsed ? "lg:w-[76px]" : "lg:w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <BrandMark collapsed={collapsed} />
        </div>

        <SidebarNav navItems={navItems} collapsed={collapsed} />

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
            />
            <motion.aside
              key="drawer"
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar shadow-xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="flex h-16 items-center justify-between px-4">
                <BrandMark collapsed={false} />
                <button
                  onClick={onMobileClose}
                  className="rounded-lg p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarNav navItems={navItems} collapsed={false} onNavigate={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
