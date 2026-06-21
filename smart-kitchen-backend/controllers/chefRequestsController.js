"use strict";

const {
    getPendingChefRequests,
    getChefRequestById,
    getChefRequestByUserId,
    getPendingChefRequestByUserId,
    createChefRequest
} = require("../models/chefRequestsModel");

const { sequelize, User, ChefRequest } = require("../models/index");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const { notify } = require("../services/notificationService");

// req.authUser is guaranteed by authorize() on this route.
// Only reason is accepted from the client; userId comes from the authenticated session.
async function submitChefRequest(req, res, next) {
    try {
        const { userId, userRole } = req.authUser;

        if (userRole === "chef" || userRole === "admin") {
            return errorResponse(res, 400, "INVALID_REQUEST", "Your account is already a chef or admin.");
        }

        // Explicit pending query: getChefRequestByUserId returns the most recent request, which
        // may be a newer rejected/approved entry that does not represent an active pending request.
        const pendingRequest = await getPendingChefRequestByUserId(userId);
        if (pendingRequest) {
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

// req.authUser is guaranteed by authorize() on this route.
async function getMyChefRequest(req, res, next) {
    try {
        const { userId } = req.authUser;
        const request = await getChefRequestByUserId(userId);
        return successResponse(res, 200, request || null);
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

// Approval is atomic. The pending-status check and both writes happen inside a managed
// Sequelize transaction with a row lock so concurrent approve/reject calls cannot both
// process the same pending request.
async function approveChefRequest(req, res, next) {
    try {
        const requestId = Number(req.params.requestId);
        const adminId = req.authUser.userId;

        // Fast existence check before acquiring the lock.
        const preCheck = await getChefRequestById(requestId);
        if (!preCheck) {
            return errorResponse(res, 404, "REQUEST_NOT_FOUND", "Chef request not found.");
        }

        // Status error detected inside the transaction is surfaced here after rollback.
        let statusError = null;

        await sequelize.transaction(async (t) => {
            // Lock the row: a concurrent approve or reject must wait until this transaction commits.
            const instance = await ChefRequest.findByPk(requestId, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            // Re-check inside the lock: another concurrent operation may have changed status.
            if (!instance || instance.status !== "pending") {
                statusError = "Only pending requests can be approved.";
                return; // No writes; transaction commits as a no-op.
            }

            await instance.update(
                { status: "approved", reviewedDate: new Date(), reviewedBy: adminId },
                { transaction: t }
            );

            // Role set server-side to exactly "chef" — not controlled by the client.
            const [affectedCount] = await User.update(
                { userRole: "chef" },
                { where: { userId: instance.userId }, transaction: t }
            );
            if (affectedCount === 0) {
                // User was deleted between the pre-check and the lock; abort entirely.
                throw new Error("User not found during approval; rolling back.");
            }
        });

        if (statusError) {
            return errorResponse(res, 400, "INVALID_STATUS", statusError);
        }
        const updatedRequest = await getChefRequestById(requestId);

        // Notify the requesting user after the transaction has committed
        notify({
            userId: updatedRequest.userId,
            type: "chef_approved",
            message: "Your chef request has been approved! You are now a chef.",
            sourceUserId: adminId,
            entityId: requestId,
            entityType: "chef_request"
        }).catch(err => console.error("[notification] chef_approved trigger failed:", err.message));

        return successResponse(res, 200, updatedRequest);
    } catch (error) {
        next(error);
    }
}

// Rejection uses the same row-locking strategy so it cannot race with approve.
async function rejectChefRequest(req, res, next) {
    try {
        const requestId = Number(req.params.requestId);
        const adminId = req.authUser.userId;

        const preCheck = await getChefRequestById(requestId);
        if (!preCheck) {
            return errorResponse(res, 404, "REQUEST_NOT_FOUND", "Chef request not found.");
        }

        let statusError = null;

        await sequelize.transaction(async (t) => {
            const instance = await ChefRequest.findByPk(requestId, {
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (!instance || instance.status !== "pending") {
                statusError = "Only pending requests can be rejected.";
                return;
            }

            await instance.update(
                { status: "rejected", reviewedDate: new Date(), reviewedBy: adminId },
                { transaction: t }
            );
        });

        if (statusError) {
            return errorResponse(res, 400, "INVALID_STATUS", statusError);
        }
        const updatedRequest = await getChefRequestById(requestId);

        // Notify the requesting user after the transaction has committed
        notify({
            userId: updatedRequest.userId,
            type: "chef_rejected",
            message: "Your chef request has been reviewed and was not approved at this time.",
            sourceUserId: adminId,
            entityId: requestId,
            entityType: "chef_request"
        }).catch(err => console.error("[notification] chef_rejected trigger failed:", err.message));

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
