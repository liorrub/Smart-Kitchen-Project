"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("Review", {
    reviewId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: "Rating must be an integer" },
            min: { args: [1], msg: "Rating must be at least 1" },
            max: { args: [5], msg: "Rating cannot exceed 5" }
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notNull: { msg: "Title is required" },
            notEmpty: { msg: "Title cannot be empty" }
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notNull: { msg: "Comment is required" },
            notEmpty: { msg: "Comment cannot be empty" }
        }
    },
    isInfluencer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    helpfulVotes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: "Reviews",
    timestamps: true
});

module.exports = Review;
