"use strict";

// SECURITY NOTE: This project identifies callers by the x-user-id header without
// cryptographic verification. A client that knows another user's integer ID can
// impersonate them. This is an intentional educational simplification.
// All role decisions are resolved from MySQL (not from x-user-role), which removes
// role forgery. Identity forgery (x-user-id spoofing) remains until JWT or
// session tokens are introduced in a later phase.

const { errorResponse } = require("../utils/responseHelper");
const { getUserById } = require("../models/usersModel");

// Resolves the caller's user record from MySQL by x-user-id and caches it on
// req.authUser. Subsequent middleware on the same request reuses the cached value.
async function resolveAuthUser(req) {
    if (req.authUser) return true;

    const userId = Number(req.headers["x-user-id"]);
    if (!userId) return false;

    const user = await getUserById(userId);
    if (!user) return false;

    req.authUser = user;
    return true;
}

// Middleware: caller's DB role must be in allowedRoles.
function authorize(...allowedRoles) {
    return async function (req, res, next) {
        try {
            const resolved = await resolveAuthUser(req);
            if (!resolved) {
                return errorResponse(
                    res,
                    403,
                    "FORBIDDEN",
                    "You do not have permission to perform this action."
                );
            }

            if (!allowedRoles.includes(req.authUser.userRole)) {
                return errorResponse(
                    res,
                    403,
                    "FORBIDDEN",
                    "You do not have permission to perform this action."
                );
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

// Middleware: caller must be admin (by DB role) or be accessing their own /:id.
async function allowSelfOrAdmin(req, res, next) {
    try {
        const resolved = await resolveAuthUser(req);
        if (!resolved) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to perform this action."
            );
        }

        const requestedUserId = Number(req.params.id);

        if (req.authUser.userRole === "admin") {
            return next();
        }

        if (req.authUser.userId !== requestedUserId) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to perform this action."
            );
        }

        next();
    } catch (error) {
        next(error);
    }
}

// Middleware: caller must be accessing their own /:id (admin bypass is not granted).
async function allowSelfOnly(req, res, next) {
    try {
        const resolved = await resolveAuthUser(req);
        if (!resolved) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to perform this action."
            );
        }

        const requestedUserId = Number(req.params.id);

        if (req.authUser.userId !== requestedUserId) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You can only access your own data."
            );
        }

        next();
    } catch (error) {
        next(error);
    }
}

// Middleware: any authenticated caller (any role is accepted).
// Use for endpoints that only need identity, not a specific role.
async function requireAuth(req, res, next) {
    try {
        const resolved = await resolveAuthUser(req);
        if (!resolved) {
            return errorResponse(
                res,
                401,
                "UNAUTHORIZED",
                "Authentication is required."
            );
        }
        next();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    authorize,
    allowSelfOrAdmin,
    allowSelfOnly,
    requireAuth
};
