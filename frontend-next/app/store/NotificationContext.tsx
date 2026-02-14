"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useApp } from "./Context";

/* ---------------- TYPES ---------------- */

export type ToastStatus = "success" | "error" | "info" | "warning";

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  status?: ToastStatus;
}

export interface ToastNotification extends Notification {
  id: string; // Toast ID (local)
  timeoutId: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;

  toasts: ToastNotification[];
  showToast: (notification: Notification) => void;
  hideToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => void;
}

/* ---------------- CONTEXT ---------------- */

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/* ---------------- API HELPERS ---------------- */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ---------------- PROVIDER ---------------- */

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ---------- FETCH NOTIFICATIONS ---------- */
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      // console.log("FETCH NOTIF: No user, clearing.");
      setNotifications([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // console.log("FETCH NOTIF: Fetching for user", user._id);
      const { data } = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("FETCH NOTIF: Fetched count:", data.length);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, [user]);

  // Sync on mount/user change [Task: Login Restoration]
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /* ---------- REAL-TIME SOCKET LISTENER ---------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // We use a direct socket connection or reuse useSocket if possible.
    // Since we are in a Provider, we might create a dedicated listener.
    // For simplicity, we can assume the Global Socket (if exists) or create a temporary one.
    // Ideally we should use the useSocket hook, but let's check imports.
    // Importing useSocket requires ensuring it doesn't create circular deps or multiple connections.
    // Let's rely on the fact that existing app puts socket in `window` or similar? No.
    // Let's use `io` directly here just for the event listener if useSocket isn't available in Context.
    // Actually, let's use the import if available.
    // Check imports... useApp is there.

    // To avoid complexity, we'll try to listen if we can access the socket instance.
    // If not, we will rely on `Layout.tsx` which typically handles global sockets in Next.js apps.
    // BUT user says it works in real-time. So someone IS listening.
    // Adding a second listener is safe.

    // Let's SKIP adding a new socket connection here to avoid duplicates/auth issues.
    // Instead, rely on fetch.

  }, []);

  /* ---------- API ACTIONS ---------- */
  const markNotificationAsRead = async (_id: string) => {
    // Optimistic Update
    setNotifications((prev) =>
      prev.map((n) => (n._id === _id ? { ...n, isRead: true } : n))
    );

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/notifications/${_id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const deleteNotification = async (_id: string) => {
    // Optimistic Update [Task: Delete Function]
    setNotifications((prev) => prev.filter((n) => n._id !== _id));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/notifications/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to delete notification", error);
      // Revert if needed, but for now silent fail is okayish
      fetchNotifications();
    }
  };

  /* ---------- TOAST ---------- */

  const showToast = (notification: Notification) => {
    const id = Date.now().toString();

    // Visual Toast
    const timeoutId = window.setTimeout(() => {
      hideToast(id);
    }, 5000);

    setToasts((prev) => [
      {
        ...notification,
        id,
        timeoutId,
      },
      ...prev,
    ]);

    // Add to list if it's new (Socket events trigger this)
    // We check if it already exists to avoid dupes if fetch happens same time
    setNotifications((prev) => {
      if (prev.some(n => n._id === notification._id)) return prev;
      return [notification, ...prev];
    });
  };

  const hideToast = (id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast) clearTimeout(toast.timeoutId);
      return prev.filter((t) => t.id !== id);
    });
  };

  const clearAllNotifications = async () => {
    // Optimistic Update
    setNotifications([]);

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Failed to clear all notifications", error);
      fetchNotifications(); // Revert on failure
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        hideToast,
        markNotificationAsRead,
        deleteNotification,
        clearAllNotifications,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/* ---------------- HOOK ---------------- */

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }
  return ctx;
};