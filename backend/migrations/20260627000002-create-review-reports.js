"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("ReviewReports", {
            reportId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            reviewId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Reviews", key: "reviewId" },
                onDelete: "CASCADE"
            },
            reporterUserId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Users", key: "userId" },
                onDelete: "CASCADE"
            },
            reason: {
                type: Sequelize.ENUM("spam", "inappropriate", "harassment", "misinformation", "off-topic", "other"),
                allowNull: false
            },
            details: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM("open", "dismissed", "actioned"),
                allowNull: false,
                defaultValue: "open"
            },
            reviewedByUserId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: { model: "Users", key: "userId" },
                onDelete: "SET NULL"
            },
            reviewedAt: {
                type: Sequelize.DATE,
                allowNull: true
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

        await queryInterface.addIndex("ReviewReports", ["reviewId"], {
            name: "rr_review_idx"
        });
        await queryInterface.addIndex("ReviewReports", ["reporterUserId"], {
            name: "rr_reporter_idx"
        });
        await queryInterface.addIndex("ReviewReports", ["status"], {
            name: "rr_status_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("ReviewReports");
    }
};
