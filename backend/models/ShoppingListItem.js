"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ShoppingListItem = sequelize.define("ShoppingListItem", {
    shoppingItemId: {
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
                if (value <= 0) throw new Error("Quantity must be greater than 0");
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
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    source: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: "ShoppingList",
    timestamps: true,
    createdAt: "createDate",
    updatedAt: "updateDate"
});

module.exports = ShoppingListItem;
