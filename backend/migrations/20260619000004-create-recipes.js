"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Recipes", {
            recipeId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            instructions: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            difficulty: {
                type: Sequelize.ENUM("easy", "medium", "hard"),
                allowNull: false
            },
            cuisine: {
                type: Sequelize.ENUM(
                    "italian", "asian", "mexican", "american", "israeli"
                ),
                allowNull: false
            },
            category: {
                type: Sequelize.ENUM(
                    "breakfast", "lunch", "dinner", "dessert", "snack"
                ),
                allowNull: false
            },
            creatorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            prepTime: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            cookTime: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            totalTime: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            servings: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            calories: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            tags: {
                type: Sequelize.JSON,
                allowNull: false
            },
            allergens: {
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

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Recipes");
    }
};
