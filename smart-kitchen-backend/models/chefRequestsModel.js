const chefRequests = require("../data/chefRequests.json");
const { generateId } = require("../utils/idGenerator");
const { getCurrentDateTime } = require("../utils/dateHelper");

async function getPendingChefRequests() {
    return chefRequests.filter((r) => r.status === "pending");
}

async function getChefRequestById(requestId) {
    return chefRequests.find((r) => r.requestId === requestId) || null;
}

async function getChefRequestByUserId(userId) {
    const userRequests = chefRequests.filter((r) => r.userId === userId);
    if (userRequests.length === 0) return null;
    return userRequests.sort(
        (a, b) => new Date(b.requestDate) - new Date(a.requestDate)
    )[0];
}

async function createChefRequest(requestData) {
    const newRequest = {
        requestId: generateId(chefRequests, "requestId"),
        userId: requestData.userId,
        status: "pending",
        reason: requestData.reason || "",
        requestDate: getCurrentDateTime(),
        reviewedDate: null,
        reviewedBy: null
    };
    chefRequests.push(newRequest);
    return newRequest;
}

async function updateChefRequest(requestId, updatedData) {
    const index = chefRequests.findIndex((r) => r.requestId === requestId);
    if (index === -1) return null;
    chefRequests[index] = { ...chefRequests[index], ...updatedData };
    return chefRequests[index];
}

module.exports = {
    getPendingChefRequests,
    getChefRequestById,
    getChefRequestByUserId,
    createChefRequest,
    updateChefRequest
};
