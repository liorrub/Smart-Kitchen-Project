"use strict";

const { Notification, User } = require("./index");

// Safe subset of sourceUser fields returned in every notification
const SOURCE_USER_ATTRIBUTES = ["userId", "firstName", "lastName"];

// Standard include for the source user (safe fields only)
const sourceUserInclude = {
    model: User,
    as: "sourceUser",
    attributes: SOURCE_USER_ATTRIBUTES,
    required: false
};

async function createNotification({ userId, type, message, sourceUserId = null, entityId = null, entityType = null, commentId = null }) {
    const row = await Notification.create({
        userId,
        type,
        message,
        sourceUserId: sourceUserId || null,
        entityId: entityId || null,
        entityType: entityType || null,
        commentId: commentId || null,
        isRead: false
    });

    return Notification.findByPk(row.notificationId, {
        include: [sourceUserInclude]
    });
}

async function getNotificationsForUser(userId, { limit = 20, unreadOnly = false } = {}) {
    const where = { userId };
    if (unreadOnly) where.isRead = false;

    return Notification.findAll({
        where,
        include: [sourceUserInclude],
        order: [
            ["createdAt", "DESC"],
            ["notificationId", "DESC"]
        ],
        limit: Math.min(Number(limit) || 20, 100)
    });
}

async function getUnreadCount(userId) {
    return Notification.count({ where: { userId, isRead: false } });
}

async function markNotificationRead(notificationId, userId) {
    const notification = await Notification.findOne({
        where: { notificationId, userId }
    });

    if (!notification) return null;

    await notification.update({ isRead: true });

    return Notification.findByPk(notificationId, { include: [sourceUserInclude] });
}

async function markAllNotificationsRead(userId) {
    const [count] = await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
    );
    return count;
}

module.exports = {
    createNotification,
    getNotificationsForUser,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
};
