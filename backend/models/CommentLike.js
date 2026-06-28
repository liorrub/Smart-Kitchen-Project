"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CommentLike = sequelize.define(
    "CommentLike",
    {
        commentLikeId: {
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
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "RecipeComments",
                key: "commentId"
            }
        }
    },
    {
        tableName: "CommentLikes",
        timestamps: true
    }
);

module.exports = CommentLike;
