"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Bell, XCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotifications } from '@/app/store/NotificationContext';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markNotificationAsRead, deleteNotification, clearAllNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   fetchNotifications(); // Fetch notifications on component mount
  // }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bellRef.current && !bellRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl py-2 z-50 border border-gray-100 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start p-4 border-b border-gray-100 ${!notif.isRead ? 'bg-blue-50' : ''
                    } hover:bg-gray-50`}
                >
                  <div className="mr-3 mt-1">{getNotificationIcon(notif.status)}</div>
                  <div className="flex-grow">
                    <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'font-semibold text-gray-800'}`}>
                      {notif.message}
                    </p>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center ml-auto gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notif._id);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1 hover:bg-blue-50 rounded-full transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
