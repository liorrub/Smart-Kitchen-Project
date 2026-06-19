"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Recipe = sequelize.define(
    "Recipe",
    {
        recipeId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "Title is required" },
                notEmpty: { msg: "Title cannot be empty" }
            }
        },
        instructions: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: { msg: "Instructions are required" },
                notEmpty: { msg: "Instructions cannot be empty" }
            }
        },
        difficulty: {
            type: DataTypes.ENUM("easy", "medium", "hard"),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["easy", "medium", "hard"]],
                    msg: "Invalid difficulty level"
                }
            }
        },
        cuisine: {
            type: DataTypes.ENUM(
                "italian", "asian", "mexican", "american", "israeli"
            ),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["italian", "asian", "mexican", "american", "israeli"]],
                    msg: "Invalid cuisine"
                }
            }
        },
        category: {
            type: DataTypes.ENUM(
                "breakfast", "lunch", "dinner", "dessert", "snack"
            ),
            allowNull: false,
            validate: {
                isIn: {
                    args: [["breakfast", "lunch", "dinner", "dessert", "snack"]],
                    msg: "Invalid recipe category"
                }
            }
        },
        creatorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Creator ID is required" },
                isInt: { msg: "Creator ID must be an integer" }
            }
        },
        prepTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Prep time is required" },
                isInt: { msg: "Prep time must be an integer" },
                min: { args: [0], msg: "Prep time must be at least 0" }
            }
        },
        cookTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Cook time is required" },
                isInt: { msg: "Cook time must be an integer" },
                min: { args: [0], msg: "Cook time must be at least 0" }
            }
        },
        totalTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Total time is required" },
                isInt: { msg: "Total time must be an integer" },
                min: { args: [0], msg: "Total time must be at least 0" }
            }
        },
        servings: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Servings is required" },
                isInt: { msg: "Servings must be an integer" },
                min: { args: [1], msg: "Servings must be at least 1" }
            }
        },
        calories: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Calories is required" },
                isInt: { msg: "Calories must be an integer" },
                min: { args: [1], msg: "Calories must be at least 1" }
            }
        },
        tags: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        },
        allergens: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: []
        }
    },
    {
        tableName: "Recipes",
        timestamps: true
    }
);

module.exports = Recipe;
