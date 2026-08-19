import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ShoppingBag, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/context/NotificationContext";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isConnected, markAsRead, markAllAsRead } = useNotifications();

  const handleClick = (notification) => {
    if (!notification.isRead) markAsRead(notification.id);
    if (notification.relatedOrder) {
      navigate(`/admin/orders/${notification.relatedOrder}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {!isConnected && (
              <span title="Reconnecting...">
                <WifiOff className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="max-w-[200px] text-xs text-muted-foreground/70">
                You'll be notified here the moment a worker submits an order.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "flex w-full gap-2.5 border-b border-border px-3.5 py-3 text-left transition-colors last:border-0 hover:bg-accent/60",
                  !n.isRead && "bg-primary/[0.04]"
                )}
              >
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingBag className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs leading-relaxed text-foreground", !n.isRead && "font-medium")}>
                    {n.message}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatRelativeTime(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
