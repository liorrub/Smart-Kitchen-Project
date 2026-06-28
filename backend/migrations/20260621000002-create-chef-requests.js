"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("ChefRequests", {
            requestId: {
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
            status: {
                type: Sequelize.ENUM("pending", "approved", "rejected"),
                allowNull: false,
                defaultValue: "pending"
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            requestDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            reviewedDate: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: null
            },
            reviewedBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
                references: { model: "Users", key: "userId" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            }
        });

        await queryInterface.addIndex("ChefRequests", ["userId"], {
            name: "chef_requests_user_idx"
        });
        await queryInterface.addIndex("ChefRequests", ["status"], {
            name: "chef_requests_status_idx"
        });
        await queryInterface.addIndex("ChefRequests", ["userId", "status"], {
            name: "chef_requests_user_status_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("ChefRequests");
    }
};
