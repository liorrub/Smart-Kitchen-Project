"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MealPlanItem = sequelize.define("MealPlanItem", {
    mealId: {
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: { msg: "Date is required" },
            isDate: { msg: "Date must be a valid date" }
        }
    },
    mealType: {
        type: DataTypes.ENUM("breakfast", "lunch", "dinner", "snack"),
        allowNull: false,
        validate: {
            notNull: { msg: "Meal type is required" },
            isIn: {
                args: [["breakfast", "lunch", "dinner", "snack"]],
                msg: "Invalid meal type"
            }
        }
    },
    // Polymorphic discriminator — "recipe" or "ingredient"
    itemType: {
        type: DataTypes.ENUM("recipe", "ingredient"),
        allowNull: false,
        validate: {
            notNull: { msg: "Item type is required" },
            isIn: {
                args: [["recipe", "ingredient"]],
                msg: "Invalid item type"
            }
        }
    },
    // Polymorphic FK — no DB-level reference because target table depends on itemType
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: "Item ID is required" },
            isInt: { msg: "Item ID must be an integer" }
        }
    },
    calories: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: "MealPlanItems",
    timestamps: true
});

module.exports = MealPlanItem;
