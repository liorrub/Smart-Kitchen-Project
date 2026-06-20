"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define(
    "Favorite",
    {
        favoriteId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId"
            }
        },
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Recipes",
                key: "recipeId"
            }
        }
    },
    {
        tableName: "Favorites",
        timestamps: true
    }
);

module.exports = Favorite;
