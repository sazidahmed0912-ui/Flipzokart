import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useApp } from './Context';
import { useSocket } from '../hooks/useSocket';
import { fetchUserNotifications, markNotificationAsRead, deleteNotification } from '../services/api';

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  status?: 'success' | 'error' | 'info' | 'warning';
}

export interface ToastNotification extends Notification {
  id: string; // Unique ID for the toast, not necessarily _id from DB
  timeoutId: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  fetchNotifications: () => Promise<void>;
  toasts: ToastNotification[];
  showToast: (notification: Notification) => void; // Added showToast
  hideToast: (id: string) => void; // Added hideToast
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]); // New state for toasts
  const token = localStorage.getItem('token');
  const socket = useSocket(token);

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  const showToast = (notification: Notification) => {
    const id = Date.now().toString(); // Simple unique ID for the toast
    const timeoutId = setTimeout(() => {
      hideToast(id);
    }, 5000); // Toast disappears after 5 seconds

    setToasts((prev) => [{ ...notification, id, timeoutId }, ...prev]);
  };

  const hideToast = (id: string) => {
    setToasts((prev) => {
      const toastToRemove = prev.find(toast => toast.id === id);
      if (toastToRemove) {
        clearTimeout(toastToRemove.timeoutId);
      }
      return prev.filter((toast) => toast.id !== id);
    });
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const response = await fetchUserNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (socket) {
      socket.on('notification', (newNotification: Notification) => {
        console.log('Received real-time notification:', newNotification);
        setNotifications((prev) => [newNotification, ...prev]);
        showToast(newNotification); // Trigger toast for new notification
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, showToast]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    showToast(notification); // Also show toast when manually added
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Assuming an API endpoint to mark all as read
      // await authService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        toasts,
        showToast,
        hideToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
