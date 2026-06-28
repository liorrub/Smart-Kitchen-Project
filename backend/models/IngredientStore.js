"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const IngredientStore = sequelize.define("IngredientStore", {
    ingredientStoreId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ingredientId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        // DECIMAL returns as a string from MySQL; cast to number to match original JSON behavior.
        get() {
            const raw = this.getDataValue("price");
            return raw !== null && raw !== undefined ? Number(raw) : null;
        },
        validate: {
            isFloat: { msg: "Price must be a number" },
            min: { args: [0], msg: "Price must be at least 0" }
        }
    }
}, {
    tableName: "IngredientStores",
    timestamps: true,
    createdAt: false,
    updatedAt: "lastUpdated"
});

module.exports = IngredientStore;
