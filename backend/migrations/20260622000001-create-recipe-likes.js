"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("RecipeLikes", {
            likeId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
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
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex("RecipeLikes", ["userId", "recipeId"], {
            unique: true,
            name: "recipe_likes_user_recipe_unique"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("RecipeLikes");
    }
};
