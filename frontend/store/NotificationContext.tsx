import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

/* ================= TYPES ================= */

export type NotificationType = "success" | "error" | "info" | "warning";

export interface ToastNotification {
  id: string;
  message: string;
  type: NotificationType;
  timeoutId?: number;
}

interface NotificationContextType {
  toasts: ToastNotification[];
  showToast: (message: string, type?: NotificationType) => void;
  hideToast: (id: string) => void;
  clearToasts: () => void;
}

/* ================= CONTEXT ================= */

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/* ================= PROVIDER ================= */

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = (
    message: string,
    type: NotificationType = "info"
  ) => {
    const id = Date.now().toString();

    const timeoutId = window.setTimeout(() => {
      hideToast(id);
    }, 3000);

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type,
        timeoutId,
      },
    ]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast?.timeoutId) {
        clearTimeout(toast.timeoutId);
      }
      return prev.filter((t) => t.id !== id);
    });
  };

  const clearToasts = () => {
    toasts.forEach((t) => t.timeoutId && clearTimeout(t.timeoutId));
    setToasts([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        showToast,
        hideToast,
        clearToasts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }
  return context;
};