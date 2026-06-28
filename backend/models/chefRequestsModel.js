"use strict";

const { ChefRequest } = require("./index");

function toPlain(instance) {
    return instance.get({ plain: true });
}

async function getPendingChefRequests() {
    const rows = await ChefRequest.findAll({
        where: { status: "pending" },
        order: [["requestId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getChefRequestById(requestId) {
    const instance = await ChefRequest.findByPk(requestId);
    return instance ? toPlain(instance) : null;
}

// Returns the most recent request for the user (a user may have submitted more than one).
async function getChefRequestByUserId(userId) {
    const rows = await ChefRequest.findAll({
        where: { userId },
        order: [["requestDate", "DESC"]]
    });
    return rows.length === 0 ? null : toPlain(rows[0]);
}

// Explicit pending-only lookup. Used for duplicate-pending prevention so that a newer
// rejected/approved request does not mask an older pending request.
async function getPendingChefRequestByUserId(userId) {
    const instance = await ChefRequest.findOne({
        where: { userId, status: "pending" }
    });
    return instance ? toPlain(instance) : null;
}

async function createChefRequest(requestData) {
    const instance = await ChefRequest.create({
        userId: requestData.userId,
        status: "pending",
        reason: requestData.reason || "",
        requestDate: new Date(),
        reviewedDate: null,
        reviewedBy: null
    });
    return toPlain(instance);
}

// Whitelists only the fields used for approve/reject to prevent mass-assignment.
async function updateChefRequest(requestId, updatedData, options = {}) {
    const instance = await ChefRequest.findByPk(requestId, options);
    if (!instance) return null;
    const { status, reviewedDate, reviewedBy } = updatedData;
    const safeData = {};
    if (status !== undefined) safeData.status = status;
    if (reviewedDate !== undefined) safeData.reviewedDate = reviewedDate;
    if (reviewedBy !== undefined) safeData.reviewedBy = reviewedBy;
    await instance.update(safeData, options);
    return toPlain(instance);
}

module.exports = {
    getPendingChefRequests,
    getChefRequestById,
    getChefRequestByUserId,
    getPendingChefRequestByUserId,
    createChefRequest,
    updateChefRequest
};
