const { errorResponse } = require("../utils/responseHelper");

// Middleware for role-based authorization
function authorize(...allowedRoles) {
    return function (req, res, next) {
        // Read user info from request headers
        const userRole = req.headers["x-user-role"];
        const userId = req.headers["x-user-id"];

        // Block access if no role was provided
        if (!userRole) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to perform this action."
            );
        }

        // Check if the user's role is allowed
        if (!allowedRoles.includes(userRole)) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to perform this action."
            );
        }

        // Save current user info for later use
        req.currentUser = {
            userRole: userRole,
            userId: userId ? Number(userId) : null
        };

        next();
    };
}

// Middleware that allows only the user himself or admin
function allowSelfOrAdmin(req, res, next) {
    const userRole = req.headers["x-user-role"];
    const userId = Number(req.headers["x-user-id"]);
    const requestedUserId = Number(req.params.id);

    // Block access if no role was provided
    if (!userRole) {
        return errorResponse(
            res,
            403,
            "FORBIDDEN",
            "You do not have permission to perform this action."
        );
    }

    // Admin can always continue
    if (userRole === "admin") {
        return next();
    }

    // Regular users can only access their own data
    if (userId !== requestedUserId) {
        return errorResponse(
            res,
            403,
            "FORBIDDEN",
            "You do not have permission to perform this action."
        );
    }

    next();
}

module.exports = {
    authorize,
    allowSelfOrAdmin
};