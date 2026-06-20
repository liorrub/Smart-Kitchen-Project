"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PantryItem = sequelize.define(
    "PantryItem",
    {
        pantryItemId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Users", key: "userId" }
        },
        ingredientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Ingredients", key: "ingredientId" }
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
        },
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notNull: { msg: "Expiry date is required" },
                isDate: { msg: "Expiry date must be a valid date" }
            }
        },
        location: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notNull: { msg: "Location is required" },
                notEmpty: { msg: "Location cannot be empty" }
            }
        },
        isExpired: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "PantryItems",
        timestamps: true
    }
);

module.exports = PantryItem;
