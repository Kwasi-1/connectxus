import React, { useState, useEffect, useRef } from "react";
import { adminApi } from "@/api/admin.api";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  priority: string;
  metadata?: any;
}

export const AdminNotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await adminApi.getNotifications(
        undefined,
        undefined,
        false,
        1,
        10,
      );
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(
          data.notifications.filter((n: Notification) => !n.is_read).length,
        );
      }
    } catch (error) {
      console.error("Failed to fetch admin notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                      !notification.is_read
                        ? "bg-blue-50 dark:bg-blue-900/10"
                        : ""
                    }`}
                    onClick={() =>
                      !notification.is_read && handleMarkAsRead(notification.id)
                    }
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
            <a
              href="/admin/notifications"
              className="block bg-gray-50 dark:bg-gray-800 text-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-700 font-medium"
            >
              View all notifications
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
