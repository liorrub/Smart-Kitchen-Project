"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Notifications", {
            notificationId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Users", key: "userId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            type: {
                type: Sequelize.ENUM(
                    "follow",
                    "comment_reply",
                    "mention",
                    "chef_approved",
                    "chef_rejected"
                ),
                allowNull: false
            },
            message: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            sourceUserId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: "Users", key: "userId" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },
            entityId: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            entityType: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            isRead: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex("Notifications", ["userId"], {
            name: "notifications_user_idx"
        });

        await queryInterface.addIndex("Notifications", ["userId", "isRead"], {
            name: "notifications_user_isread_idx"
        });

        await queryInterface.addIndex("Notifications", ["userId", "createdAt"], {
            name: "notifications_user_createdat_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("Notifications");
    }
};
