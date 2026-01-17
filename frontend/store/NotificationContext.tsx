import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

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
  id: string;
  timeoutId: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;

  toasts: ToastNotification[];
  showToast: (notification: Notification) => void;
  hideToast: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
}

/* ---------------- CONTEXT ---------------- */

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/* ---------------- PROVIDER ---------------- */

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* ---------- TOAST ---------- */

  const showToast = (notification: Notification) => {
    const id = Date.now().toString();

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

    // Add the notification to the notifications array for tracking
    setNotifications((prev) => [notification, ...prev]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast) clearTimeout(toast.timeoutId);
      return prev.filter((t) => t.id !== id);
    });
  };

  const markNotificationAsRead = (_id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification._id === _id ? { ...notification, isRead: true } : notification
      )
    );
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