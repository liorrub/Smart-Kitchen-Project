"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("RecipeIngredients", {
            recipeIngredientId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            recipeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Recipes",
                    key: "recipeId"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            ingredientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Ingredients",
                    key: "ingredientId"
                },
                onDelete: "RESTRICT",
                onUpdate: "CASCADE"
            },
            quantity: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            unit: {
                type: Sequelize.STRING(50),
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("RecipeIngredients");
    }
};
