"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReviewReport = sequelize.define("ReviewReport", {
    reportId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reporterUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reason: {
        type: DataTypes.ENUM("spam", "inappropriate", "harassment", "misinformation", "off-topic", "other"),
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM("open", "dismissed", "actioned"),
        allowNull: false,
        defaultValue: "open"
    },
    reviewedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: "ReviewReports",
    timestamps: true
});

module.exports = ReviewReport;
