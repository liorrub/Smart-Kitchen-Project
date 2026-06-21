"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const UserFollow = sequelize.define(
    "UserFollow",
    {
        followId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        followerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId"
            },
            validate: {
                notNull: { msg: "followerId is required" }
            }
        },
        followeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId"
            },
            validate: {
                notNull: { msg: "followeeId is required" },
                notSelf(value) {
                    if (Number(value) === Number(this.followerId)) {
                        throw new Error("A user cannot follow themselves.");
                    }
                }
            }
        }
    },
    {
        tableName: "UserFollows",
        timestamps: true
    }
);

module.exports = UserFollow;
