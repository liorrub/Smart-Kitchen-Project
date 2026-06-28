"use strict";

// Creates the RecipeComments table for the recipe discussion feature.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("RecipeComments", {
            commentId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            recipeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Recipes", key: "recipeId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Users", key: "userId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            // Null for top-level comments; set to parent commentId for replies
            parentCommentId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
                references: { model: "RecipeComments", key: "commentId" },
                onDelete: "SET NULL",
                onUpdate: "CASCADE"
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            tags: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null
            },
            // The user tagged with @ in this comment
            mentionedUserId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: null,
                references: { model: "Users", key: "userId" },
                onDelete: "SET NULL",
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
    },

    async down(queryInterface) {
        await queryInterface.dropTable("RecipeComments");
    }
};
