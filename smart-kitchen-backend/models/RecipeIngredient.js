"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RecipeIngredient = sequelize.define(
    "RecipeIngredient",
    {
        recipeIngredientId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Recipe ID is required" }
            }
        },
        ingredientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Ingredient ID is required" }
            }
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                notNull: { msg: "Quantity is required" },
                isFloat: { msg: "Quantity must be a number" },
                isPositive(value) {
                    if (value <= 0) {
                        throw new Error("Quantity must be greater than 0");
                    }
                }
            }
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "Unit is required" },
                notEmpty: { msg: "Unit cannot be empty" }
            }
        }
    },
    {
        tableName: "RecipeIngredients",
        timestamps: true
    }
);

module.exports = RecipeIngredient;
