const {
    getUserByEmail,
    getUserById
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Login user
async function login(req, res, next) {
    try {
        const user = await getUserByEmail(
            req.body.email
        );

        if (!user || user.password !== req.body.password) {
            return errorResponse(
                res,
                401,
                "INVALID_CREDENTIALS",
                "Invalid email or password"
            );
        }

        const mockToken = `mock-token-${user.userId}`;

        return successResponse(res, 200, {
            userId: user.userId,
            firstName: user.firstName,
            userRole: user.userRole,
            token: mockToken
        });
    } catch (error) {
        next(error);
    }
}

// Current user
async function getCurrentUser(req, res, next) {
    try {
        const userId = Number(
            req.headers["x-user-id"]
        );

        if (!userId) {
            return errorResponse(
                res,
                401,
                "UNAUTHORIZED",
                "Authentication required"
            );
        }

        const user = await getUserById(userId);

        if (!user) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        const { password, ...safeUser } = user;

        return successResponse(
            res,
            200,
            safeUser
        );
    } catch (error) {
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        return successResponse(
            res,
            200,
            {
                message: "Logged out successfully"
            }
        );
    }
    catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    getCurrentUser,
    logout
};