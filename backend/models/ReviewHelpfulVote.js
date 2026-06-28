"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReviewHelpfulVote = sequelize.define("ReviewHelpfulVote", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "ReviewHelpfulVotes",
    timestamps: true,
    indexes: [
        { unique: true, fields: ["reviewId", "userId"] }
    ]
});

module.exports = ReviewHelpfulVote;
