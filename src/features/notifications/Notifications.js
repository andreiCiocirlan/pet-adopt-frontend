import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/context/AuthContext";
import { authFetch } from "../auth/utils/authFetch";

// API functions
function notificationsApi(userId) {
  return {
    getUnreadCount: () => {
      return authFetch(`http://localhost:8081/api/notifications/count`);
    },
    getNotifications: (unreadOnly = false) => {
      const params = new URLSearchParams({ unreadOnly: unreadOnly });
      return authFetch(`http://localhost:8081/api/notifications?${params}`);
    },
    markAsRead: (notificationId) => {
      return authFetch(`http://localhost:8081/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
    },
    markAllAsRead: () => {
      return authFetch(`http://localhost:8081/api/notifications/read-all`, {
        method: 'POST'
      });
    },
  };
}

export default function Notifications() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const api = notificationsApi(userId);

      const [notifsResponse, countResponse] = await Promise.all([
        api.getNotifications(false),
        api.getUnreadCount()
      ]);

      const notifs = await notifsResponse.json();
      const count = await countResponse.json();

      setNotifications(notifs);
      setUnreadCount(count.unreadCount);
      setError(null);
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // PERMANENT optimistic update - NO auto-refresh
  const markAsRead = async (notificationId) => {
    // 1. INSTANT visual update
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const api = notificationsApi(userId);
      await api.markAsRead(notificationId); // Fire and forget
    } catch (err) {
      // Revert only on error
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: false } : notif
        )
      );
      setUnreadCount(prev => prev + 1);
      setError('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    // 1. FORCE re-render by creating NEW array reference
    const allReadNotifications = notifications.map(notif => ({
      ...notif,
      isRead: true
    }));

    setNotifications(allReadNotifications);  // Direct assignment triggers re-render
    setUnreadCount(0);

    try {
      const api = notificationsApi(userId);
      await api.markAllAsRead(); // Fire and forget
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔔</div>
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const itemClass = notification.isRead
              ? 'p-4 rounded-lg border bg-gray-100 border-gray-300 hover:bg-gray-200 opacity-60 cursor-default select-none transition-all'
              : 'p-4 rounded-lg border-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer ring-1 ring-blue-200 hover:ring-blue-300';

            return (
              <div
                key={notification.id}
                className={itemClass}
                title={notification.isRead ? 'Read' : 'Unread'}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Appointment #{notification.appointmentId} • {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
