"use strict";

// Creates the AiHistory table.
// Stores per-user AI feature calls: recipe generation, suggestions, ingredient substitute.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("AiHistory", {
            historyId: {
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
            requestType: {
                type: Sequelize.ENUM("recipe_generation", "suggestions", "ingredient_substitute"),
                allowNull: false
            },
            inputData: {
                type: Sequelize.JSON,
                allowNull: false
            },
            outputData: {
                type: Sequelize.JSON,
                allowNull: false
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable("AiHistory");
    }
};
