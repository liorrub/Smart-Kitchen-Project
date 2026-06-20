"use strict";

// Sequelize model for AI request history.
// Stores every AI feature call (recipe generation, suggestions, ingredient substitute)
// per user. AI-generated content never touches the Recipes table.

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AiHistory = sequelize.define(
    "AiHistory",
    {
        historyId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        requestType: {
            type: DataTypes.ENUM("recipe_generation", "suggestions", "ingredient_substitute"),
            allowNull: false
        },
        // What the user sent to the AI (selected ingredients, constraints, question, etc.)
        inputData: {
            type: DataTypes.JSON,
            allowNull: false
        },
        // What Gemini returned, stored as structured JSON
        outputData: {
            type: DataTypes.JSON,
            allowNull: false
        }
    },
    {
        tableName: "AiHistory",
        timestamps: true
    }
);

module.exports = AiHistory;
