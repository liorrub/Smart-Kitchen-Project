"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Ingredient = sequelize.define(
    "Ingredient",
    {
        ingredientId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "Ingredient name is required" },
                notEmpty: { msg: "Ingredient name cannot be empty" }
            },
            set(value) {
                this.setDataValue(
                    "name",
                    typeof value === "string" ? value.trim() : value
                );
            }
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "Ingredient category is required" },
                notEmpty: { msg: "Ingredient category cannot be empty" }
            },
            set(value) {
                this.setDataValue(
                    "category",
                    typeof value === "string" ? value.trim() : value
                );
            }
        },
        isAllergen: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            validate: {
                notNull: { msg: "isAllergen is required" }
            }
        }
    },
    {
        tableName: "Ingredients",
        timestamps: true
    }
);

module.exports = Ingredient;
