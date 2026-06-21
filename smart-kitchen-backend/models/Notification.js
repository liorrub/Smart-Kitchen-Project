"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define(
    "Notification",
    {
        notificationId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "userId is required" },
                isInt: { msg: "userId must be an integer" }
            }
        },
        type: {
            type: DataTypes.ENUM(
                "follow",
                "recipe_comment",
                "comment_reply",
                "mention",
                "chef_approved",
                "chef_rejected"
            ),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["follow", "recipe_comment", "comment_reply", "mention", "chef_approved", "chef_rejected"]],
                    msg: "Invalid notification type"
                }
            }
        },
        message: {
            type: DataTypes.STRING(500),
            allowNull: false,
            validate: {
                notNull: { msg: "message is required" },
                notEmpty: { msg: "message cannot be empty" }
            }
        },
        sourceUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        entityType: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: null
        },
        // For comment_reply and mention: the specific comment that triggered this notification.
        // Used by the frontend to scroll to and highlight the comment in the discussion.
        // SET NULL when the comment is deleted so the notification remains accessible.
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "Notifications",
        timestamps: true
    }
);

module.exports = Notification;
