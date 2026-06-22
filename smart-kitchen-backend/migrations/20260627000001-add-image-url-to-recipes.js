"use strict";

// Adds a nullable imageUrl column to the Recipes table.
// Stores either an uploaded file path (/uploads/recipes/filename.jpg)
// or an external URL. Null means the UI falls back to a category/cuisine placeholder.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Recipes", "imageUrl", {
            type: Sequelize.STRING(500),
            allowNull: true,
            defaultValue: null,
            after: "allergens"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("Recipes", "imageUrl");
    }
};
