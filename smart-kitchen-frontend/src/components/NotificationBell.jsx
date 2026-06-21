import "./NotificationBell.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "../context/NotificationContext";

// Human-readable relative time label
function relativeTime(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// Navigation targets per notification type.
// comment_reply and mention include ?commentId= so the discussion page can
// scroll to and highlight the specific comment.
function notificationHref(notification) {
    switch (notification.type) {
        case "follow":
            return notification.sourceUser
                ? `/profile/${notification.sourceUser.userId}`
                : null;
        case "recipe_comment":
        case "comment_reply":
        case "mention": {
            if (!notification.entityId) return null;
            const base = `/recipes/${notification.entityId}/discussion`;
            return notification.commentId
                ? `${base}?commentId=${notification.commentId}`
                : base;
        }
        case "chef_approved":
        case "chef_rejected":
            return "/settings";
        default:
            return null;
    }
}

// Badge label: cap at 99+
function badgeLabel(count) {
    if (count > 99) return "99+";
    if (count > 9) return "9+";
    return String(count);
}

function NotificationBell() {
    const navigate = useNavigate();
    const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

    const [open, setOpen] = useState(false);

    const containerRef = useRef(null);

    // Close on click-outside
    useEffect(() => {
        function handleClick(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    const handleBellClick = useCallback(() => {
        setOpen(prev => !prev);
    }, []);

    const handleNotificationClick = useCallback(async (notification) => {
        setOpen(false);
        if (!notification.isRead) {
            await markRead(notification.notificationId);
        }
        const href = notificationHref(notification);
        if (href) navigate(href);
    }, [markRead, navigate]);

    const handleMarkAll = useCallback(async (e) => {
        e.stopPropagation();
        await markAllRead();
    }, [markAllRead]);

    return (
        <div className="notif-bell-wrapper" ref={containerRef}>
            <button
                type="button"
                className="notif-bell-btn"
                onClick={handleBellClick}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={open}
            >
                <span className="notif-bell-icon" aria-hidden="true">🔔</span>
                {unreadCount > 0 && (
                    <span className="notif-bell-badge">{badgeLabel(unreadCount)}</span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown" role="dialog" aria-label="Notifications">
                    <div className="notif-dropdown-header">
                        <span className="notif-dropdown-title">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="notif-mark-all-btn"
                                onClick={handleMarkAll}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notif-list">
                        {loading && (
                            <p className="notif-state-msg">Loading…</p>
                        )}

                        {!loading && notifications.length === 0 && (
                            <p className="notif-state-msg">No notifications yet.</p>
                        )}

                        {!loading && notifications.map(n => (
                            <button
                                key={n.notificationId}
                                type="button"
                                className={`notif-item ${!n.isRead ? "notif-item--unread" : ""}`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                {!n.isRead && <span className="notif-unread-dot" aria-hidden="true" />}
                                <span className="notif-item-body">
                                    <span className="notif-item-message">{n.message}</span>
                                    <span className="notif-item-time">{relativeTime(n.createdAt)}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
