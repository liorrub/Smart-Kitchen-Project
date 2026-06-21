"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Store = sequelize.define("Store", {
    storeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notNull: { msg: "Store name is required" },
            notEmpty: { msg: "Store name cannot be empty" }
        }
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notNull: { msg: "City is required" },
            notEmpty: { msg: "City cannot be empty" }
        }
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: { msg: "Address is required" },
            notEmpty: { msg: "Address cannot be empty" }
        }
    },
    rating: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        // DECIMAL returns as a string from MySQL; cast to number to match original JSON behavior.
        get() {
            const raw = this.getDataValue("rating");
            return raw !== null && raw !== undefined ? Number(raw) : null;
        },
        validate: {
            isFloat: { msg: "Rating must be a number" },
            min: { args: [0], msg: "Rating must be at least 0" },
            max: { args: [5], msg: "Rating cannot exceed 5" }
        }
    }
}, {
    tableName: "Stores",
    timestamps: true
});

module.exports = Store;
