"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ChefRequest = sequelize.define(
    "ChefRequest",
    {
        requestId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            allowNull: false,
            defaultValue: "pending",
            validate: {
                isIn: {
                    args: [["pending", "approved", "rejected"]],
                    msg: "Status must be pending, approved, or rejected"
                }
            }
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ""
        },
        requestDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        reviewedDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null
        },
        reviewedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    },
    {
        tableName: "ChefRequests",
        timestamps: false
    }
);

module.exports = ChefRequest;
