"use strict";

// Adds approvalStatus, reviewedByUserId, reviewedAt, rejectionReason to Recipes.
// DEFAULT 'approved' backfills all existing recipes as approved so nothing breaks.
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Recipes", "approvalStatus", {
            type: Sequelize.ENUM("pending", "approved", "rejected"),
            allowNull: false,
            defaultValue: "approved",
            after: "allergens"
        });
        await queryInterface.addColumn("Recipes", "reviewedByUserId", {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: { model: "Users", key: "userId" },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            after: "approvalStatus"
        });
        await queryInterface.addColumn("Recipes", "reviewedAt", {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,
            after: "reviewedByUserId"
        });
        await queryInterface.addColumn("Recipes", "rejectionReason", {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: null,
            after: "reviewedAt"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("Recipes", "rejectionReason");
        await queryInterface.removeColumn("Recipes", "reviewedAt");
        await queryInterface.removeColumn("Recipes", "reviewedByUserId");
        await queryInterface.removeColumn("Recipes", "approvalStatus");
    }
};
