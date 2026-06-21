"use strict";

const {
    getNotificationsForUser,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
} = require("../models/notificationsModel");

const { successResponse, errorResponse } = require("../utils/responseHelper");

// GET /api/notifications
// Returns the current user's notifications, newest first.
// Supports ?limit=N (default 20, max 100) and ?unreadOnly=true
async function getNotifications(req, res, next) {
    try {
        const userId = req.authUser.userId;
        const limit = Number(req.query.limit) || 20;
        const unreadOnly = req.query.unreadOnly === "true";

        const notifications = await getNotificationsForUser(userId, { limit, unreadOnly });
        return successResponse(res, 200, notifications);
    } catch (error) {
        next(error);
    }
}

// GET /api/notifications/unread-count
// Returns { count: N } for the current user.
async function getUnreadNotificationCount(req, res, next) {
    try {
        const userId = req.authUser.userId;
        const count = await getUnreadCount(userId);
        return successResponse(res, 200, { count });
    } catch (error) {
        next(error);
    }
}

// PUT /api/notifications/read-all
// Marks all of the current user's unread notifications as read.
async function markAllRead(req, res, next) {
    try {
        const userId = req.authUser.userId;
        const count = await markAllNotificationsRead(userId);
        return successResponse(res, 200, { marked: count });
    } catch (error) {
        next(error);
    }
}

// PUT /api/notifications/:id/read
// Marks one notification as read. Returns 404 if not found or owned by another user.
async function markOneRead(req, res, next) {
    try {
        const userId = req.authUser.userId;
        const notificationId = Number(req.params.id);

        if (!notificationId) {
            return errorResponse(res, 400, "VALIDATION_ERROR", "Invalid notification ID.");
        }

        const updated = await markNotificationRead(notificationId, userId);

        if (!updated) {
            return errorResponse(res, 404, "NOT_FOUND", "Notification not found.");
        }

        return successResponse(res, 200, updated);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getNotifications,
    getUnreadNotificationCount,
    markAllRead,
    markOneRead
};
