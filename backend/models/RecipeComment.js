"use strict";

// Recipe comment model
// Represents a single comment or reply posted on a recipe's discussion page.

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RecipeComment = sequelize.define(
    "RecipeComment",
    {
        commentId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Recipe ID is required" },
                isInt: { msg: "Recipe ID must be an integer" }
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "User ID is required" },
                isInt: { msg: "User ID must be an integer" }
            }
        },
        // Null for top-level comments; set to the parent commentId for replies
        parentCommentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: "Content is required" },
                notEmpty: { msg: "Content cannot be empty" }
            }
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        // The user tagged with @ in this comment, stored as a foreign key
        mentionedUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: "RecipeComments",
        timestamps: true
    }
);

module.exports = RecipeComment;
