import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

import { useAuth } from "@/context/AuthContext";
import { notificationApi } from "@/api/notification.api";
import { toast } from "@/hooks/use-toast";

const NotificationContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;
const TOKEN_KEY = "dms_token";

/**
 * Owns both the notification feed (REST-fetched on load) and the live
 * Socket.io connection that pushes new ones in real time. Only admins
 * connect a socket at all right now — Notification is currently a
 * broadcast-to-admins-only concept (see Notification.js), so there's
 * nothing for a worker session to listen for.
 *
 * The socket is created and connected only once we know the user is an
 * authenticated admin, then explicitly disconnected on logout — rather
 * than connecting unconditionally and hoping auth sorts itself out, which
 * would leak a connection attempt for every worker session too.
 */
export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const shouldConnect = isAuthenticated && role === "admin";

    if (!shouldConnect) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Initial load from REST — the socket only delivers events that happen
    // while connected, so history has to come from the API.
    notificationApi
      .getAll()
      .then((res) => {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      })
      .catch(() => {
        // Non-fatal — the bell just starts empty; the socket can still
        // deliver new notifications from this point forward.
      });

    const token = localStorage.getItem(TOKEN_KEY);
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
      toast({ title: "New order received", description: notification.message });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, role]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(prev - 1, 0));
    try {
      await notificationApi.markAsRead(id);
    } catch {
      // Local state already reflects the intent; a failed sync here isn't
      // worth surfacing to the user for something this low-stakes.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead();
    } catch {
      // Same reasoning as markAsRead.
    }
  }, []);

  const value = { notifications, unreadCount, isConnected, markAsRead, markAllAsRead };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
};
