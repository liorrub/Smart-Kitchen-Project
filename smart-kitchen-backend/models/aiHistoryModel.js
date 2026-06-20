"use strict";

// Data access layer for AI history.
// Replaces the previous JSON-based implementation with Sequelize + MySQL.
// All functions preserve the same signatures used by aiController.js.

const { AiHistory } = require("./index");

// Returns all AI history entries for a specific user, newest first
async function getUserHistory(userId) {
    return AiHistory.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]]
    });
}

// Returns a single history entry by its primary key
async function getHistoryById(historyId) {
    return AiHistory.findByPk(historyId);
}

// Creates and persists a new AI history entry
async function addHistory(historyData) {
    return AiHistory.create(historyData);
}

// Deletes a history entry by primary key; returns true if deleted, false if not found
async function deleteHistory(historyId) {
    const item = await AiHistory.findByPk(historyId);
    if (!item) return false;
    await item.destroy();
    return true;
}

module.exports = {
    getUserHistory,
    getHistoryById,
    addHistory,
    deleteHistory
};
