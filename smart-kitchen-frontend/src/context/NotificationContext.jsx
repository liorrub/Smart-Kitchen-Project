import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket } from "../services/socketService";
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationRead as apiMarkRead,
    markAllNotificationsRead as apiMarkAllRead
} from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    // Toasts — each entry: { id, notification, expireAt }
    const [toasts, setToasts] = useState([]);

    const toastIdRef = useRef(0);

    // Idempotent upsert: insert new notifications at top, update existing in place
    function upsertNotification(incoming) {
        setNotifications(prev => {
            const exists = prev.some(n => n.notificationId === incoming.notificationId);
            if (exists) {
                return prev.map(n => n.notificationId === incoming.notificationId ? incoming : n);
            }
            return [incoming, ...prev];
        });
    }

    // Show a toast for an incoming real-time notification
    const addToast = useCallback((notification) => {
        const id = ++toastIdRef.current;
        setToasts(prev => {
            // Prevent duplicate toast for the same notificationId
            if (prev.some(t => t.notification.notificationId === notification.notificationId)) {
                return prev;
            }
            // Keep at most 5 toasts visible
            const trimmed = prev.slice(0, 4);
            return [{ id, notification }, ...trimmed];
        });
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const loadNotifications = useCallback(async () => {
        if (!user?.userId) return;
        try {
            setLoading(true);
            const [data, count] = await Promise.all([
                getNotifications({ limit: 20 }),
                getUnreadNotificationCount()
            ]);
            setNotifications(Array.isArray(data) ? data : []);
            setUnreadCount(typeof count === "number" ? count : 0);
        } catch {
            // Non-critical; bell shows 0 on failure
        } finally {
            setLoading(false);
        }
    }, [user?.userId]);

    const markRead = useCallback(async (notificationId) => {
        try {
            const updated = await apiMarkRead(notificationId);
            if (updated) {
                upsertNotification(updated);
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch {
            // Silently ignore
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await apiMarkAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {
            // Silently ignore
        }
    }, []);

    // Manage socket connection and newNotification listener
    useEffect(() => {
        if (!user?.userId) {
            // User logged out — disconnect and clear state
            disconnectSocket();
            setNotifications([]);
            setUnreadCount(0);
            setToasts([]);
            return;
        }

        // Connect (or reuse existing connection)
        const socket = connectSocket(user.userId);

        // Load initial notification state
        loadNotifications();

        function handleNewNotification(notification) {
            // Guard against already-known notifications (e.g., page reload after push)
            upsertNotification(notification);
            if (!notification.isRead) {
                setUnreadCount(prev => prev + 1);
            }
            addToast(notification);
        }

        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("newNotification", handleNewNotification);
            // Don't disconnect here — socket stays alive until logout (user becomes null)
        };
    }, [user?.userId, loadNotifications, addToast]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                toasts,
                markRead,
                markAllRead,
                removeToast,
                loadNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    return useContext(NotificationContext);
}
