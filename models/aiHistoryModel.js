const aiHistory = require("../data/aiHistory.json");

const { generateId } = require("../utils/idGenerator");
const { getCurrentDateTime } = require("../utils/dateHelper");

// Get all history
async function getAllHistory() {
    return aiHistory;
}

// Get user history
async function getUserHistory(userId) {
    return aiHistory.filter(
        item => item.userId === userId
    );
}

// Get history item
async function getHistoryById(historyId) {
    return aiHistory.find(
        item => item.historyId === historyId
    );
}

// Add history item
async function addHistory(historyData) {
    const newHistoryItem = {
        historyId: generateId(
            aiHistory,
            "historyId"
        ),
        ...historyData,
        createdAt: getCurrentDateTime()
    };

    aiHistory.push(newHistoryItem);

    return newHistoryItem;
}

// Delete history
async function deleteHistory(historyId) {
    const itemIndex = aiHistory.findIndex(
        item => item.historyId === historyId
    );

    if (itemIndex === -1) {
        return false;
    }

    aiHistory.splice(itemIndex, 1);

    return true;
}

// Filter history
async function filterHistory(filters = {}) {
    let filteredHistory = [...aiHistory];

    if (filters.userId) {
        filteredHistory = filteredHistory.filter(
            item =>
                item.userId === Number(filters.userId)
        );
    }

    if (filters.requestType) {
        filteredHistory = filteredHistory.filter(
            item =>
                item.requestType === filters.requestType
        );
    }

    return filteredHistory;
}

module.exports = {
    getAllHistory,
    getUserHistory,
    getHistoryById,
    addHistory,
    deleteHistory,
    filterHistory
};