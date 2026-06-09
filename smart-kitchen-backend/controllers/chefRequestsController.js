const {
    getPendingChefRequests,
    getChefRequestById,
    getChefRequestByUserId,
    createChefRequest,
    updateChefRequest
} = require("../models/chefRequestsModel");

const { getUserById, updateUser } = require("../models/usersModel");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const { getCurrentDateTime } = require("../utils/dateHelper");

async function submitChefRequest(req, res, next) {
    try {
        const userId = Number(req.headers["x-user-id"]);
        if (!userId) {
            return errorResponse(res, 401, "UNAUTHORIZED", "You must be logged in.");
        }
        const user = await getUserById(userId);
        if (!user) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
        }
        if (user.userRole === "chef" || user.userRole === "admin") {
            return errorResponse(res, 400, "INVALID_REQUEST", "Your account is already a chef or admin.");
        }
        const existingRequest = await getChefRequestByUserId(userId);
        if (existingRequest && existingRequest.status === "pending") {
            return errorResponse(res, 409, "REQUEST_ALREADY_EXISTS", "You already have a pending chef request.");
        }
        const newRequest = await createChefRequest({
            userId,
            reason: req.body.reason?.trim() || ""
        });
        return successResponse(res, 201, newRequest);
    } catch (error) {
        next(error);
    }
}

async function getChefRequests(req, res, next) {
    try {
        const requests = await getPendingChefRequests();
        return successResponse(res, 200, requests);
    } catch (error) {
        next(error);
    }
}

async function getMyChefRequest(req, res, next) {
    try {
        const userId = Number(req.headers["x-user-id"]);
        if (!userId) {
            return errorResponse(res, 401, "UNAUTHORIZED", "You must be logged in.");
        }
        const request = await getChefRequestByUserId(userId);
        return successResponse(res, 200, request || null);
    } catch (error) {
        next(error);
    }
}

async function approveChefRequest(req, res, next) {
    try {
        const requestId = Number(req.params.requestId);
        const adminId = Number(req.headers["x-user-id"]);
        const request = await getChefRequestById(requestId);
        if (!request) {
            return errorResponse(res, 404, "REQUEST_NOT_FOUND", "Chef request not found.");
        }
        if (request.status !== "pending") {
            return errorResponse(res, 400, "INVALID_STATUS", "Only pending requests can be approved.");
        }
        const updatedRequest = await updateChefRequest(requestId, {
            status: "approved",
            reviewedDate: getCurrentDateTime(),
            reviewedBy: adminId
        });
        await updateUser(request.userId, { userRole: "chef" });
        return successResponse(res, 200, updatedRequest);
    } catch (error) {
        next(error);
    }
}

async function rejectChefRequest(req, res, next) {
    try {
        const requestId = Number(req.params.requestId);
        const adminId = Number(req.headers["x-user-id"]);
        const request = await getChefRequestById(requestId);
        if (!request) {
            return errorResponse(res, 404, "REQUEST_NOT_FOUND", "Chef request not found.");
        }
        if (request.status !== "pending") {
            return errorResponse(res, 400, "INVALID_STATUS", "Only pending requests can be rejected.");
        }
        const updatedRequest = await updateChefRequest(requestId, {
            status: "rejected",
            reviewedDate: getCurrentDateTime(),
            reviewedBy: adminId
        });
        return successResponse(res, 200, updatedRequest);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    submitChefRequest,
    getChefRequests,
    getMyChefRequest,
    approveChefRequest,
    rejectChefRequest
};
