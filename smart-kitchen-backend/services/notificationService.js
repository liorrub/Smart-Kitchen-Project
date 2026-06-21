"use strict";

// Central notification creation path.
// All notification triggers (follow, reply, mention, chef request) go through here.

const { User } = require("../models/index");
const { createNotification } = require("../models/notificationsModel");
const { emitNotificationToUser } = require("../socket/notifications");

// Build a safe, serializable notification payload from a Sequelize instance.
// Never exposes password, email, or other private user fields.
function toSafePayload(notification) {
    if (!notification) return null;
    const plain = notification.get({ plain: true });
    return {
        notificationId: plain.notificationId,
        userId: plain.userId,
        type: plain.type,
        message: plain.message,
        sourceUser: plain.sourceUser
            ? {
                  userId: plain.sourceUser.userId,
                  firstName: plain.sourceUser.firstName,
                  lastName: plain.sourceUser.lastName
              }
            : null,
        entityId: plain.entityId,
        entityType: plain.entityType,
        commentId: plain.commentId ?? null,
        isRead: plain.isRead,
        createdAt: plain.createdAt
    };
}

/**
 * Create a notification, persist it to MySQL, then emit to the recipient's
 * personal Socket.IO room. If emission fails the notification is still saved.
 *
 * @param {object} params
 * @param {number} params.userId        - Recipient user ID
 * @param {string} params.type          - Notification type enum value
 * @param {string} params.message       - Human-readable notification text
 * @param {number} [params.sourceUserId] - User who triggered the notification
 * @param {number} [params.entityId]    - Related entity ID (recipeId, requestId, etc.)
 * @param {string} [params.entityType]  - "recipe", "user", "chef_request", etc.
 * @param {number} [params.commentId]   - For reply/mention: the triggering comment (scroll target)
 * @returns {Promise<object|null>}       - Safe payload, or null if skipped/failed
 */
async function notify({ userId, type, message, sourceUserId = null, entityId = null, entityType = null, commentId = null }) {
    // Never notify a user about their own action
    if (sourceUserId && Number(sourceUserId) === Number(userId)) return null;

    // Validate recipient exists
    const target = await User.findByPk(userId, { attributes: ["userId"] });
    if (!target) return null;

    const notification = await createNotification({
        userId,
        type,
        message,
        sourceUserId,
        entityId,
        entityType,
        commentId
    });

    if (!notification) return null;

    const payload = toSafePayload(notification);

    // Emit after the row exists — fire-and-forget
    try {
        emitNotificationToUser(userId, payload);
    } catch (emitErr) {
        console.error(`[notification] emit failed for userId=${userId}:`, emitErr.message);
    }

    return payload;
}

module.exports = { notify };
