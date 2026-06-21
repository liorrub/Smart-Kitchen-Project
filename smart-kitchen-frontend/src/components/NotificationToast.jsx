import "./NotificationToast.css";

import { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

const TOAST_DURATION_MS = 5000;

function typeLabel(type) {
    switch (type) {
        case "follow":          return "New Follower";
        case "recipe_comment":  return "New Recipe Comment";
        case "comment_reply":   return "New Reply";
        case "mention":         return "Mention";
        case "chef_approved": return "Chef Approved";
        case "chef_rejected": return "Chef Request";
        default:              return "Notification";
    }
}

function Toast({ id, notification, onDismiss }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(id), TOAST_DURATION_MS);
        return () => clearTimeout(timer);
    }, [id, onDismiss]);

    return (
        <div className="notif-toast" role="alert" aria-live="polite">
            <div className="notif-toast-header">
                <span className="notif-toast-type">{typeLabel(notification.type)}</span>
                <button
                    type="button"
                    className="notif-toast-close"
                    aria-label="Dismiss notification"
                    onClick={() => onDismiss(id)}
                >
                    ×
                </button>
            </div>
            <p className="notif-toast-message">{notification.message}</p>
        </div>
    );
}

function NotificationToastContainer() {
    const { toasts, removeToast } = useNotifications();

    if (!toasts || toasts.length === 0) return null;

    return (
        <div className="notif-toast-container" aria-label="Notification toasts">
            {toasts.map(({ id, notification }) => (
                <Toast
                    key={id}
                    id={id}
                    notification={notification}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
}

export default NotificationToastContainer;
