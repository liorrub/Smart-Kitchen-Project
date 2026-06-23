const {
    getUserById,
    getUserByEmail,
    getUserByUsername,
    updateUser
} = require("../../models/usersModel");
const { validateUsername, normalizeUsername } = require("../validators/usernameValidator");
const { isValidAvatarKey } = require("../../data/avatarCatalog");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// GET /api/settings
async function getSettings(req, res, next) {
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

// PUT /api/settings
async function updateSettings(req, res, next) {
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

        if (req.body.email) {
            const existingUser = await getUserByEmail(req.body.email);
            if (existingUser && existingUser.userId !== userId) {
                return errorResponse(res, 409, "EMAIL_ALREADY_EXISTS", "Email already exists");
            }
        }

        if (req.body.username !== undefined) {
            const usernameError = validateUsername(req.body.username);
            if (usernameError) {
                return errorResponse(res, 400, "INVALID_USERNAME", usernameError, { field: "username" });
            }
            const normalized = normalizeUsername(req.body.username);
            const existingByUsername = await getUserByUsername(normalized);
            if (existingByUsername && existingByUsername.userId !== userId) {
                return errorResponse(res, 409, "USERNAME_TAKEN", "Username is already taken");
            }
            req.body.username = normalized;
        }

        if (req.body.avatarKey !== undefined && !isValidAvatarKey(req.body.avatarKey)) {
            return errorResponse(res, 400, "INVALID_AVATAR_KEY", "Invalid avatar selection", { field: "avatarKey" });
        }

        const allowedFields = [
            "firstName", "lastName", "email",
            "city", "cookingLevel", "age", "preferences",
            "username", "avatarKey"
        ];
        const safeData = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                safeData[field] = req.body[field];
            }
        }

        const updatedUser = await updateUser(userId, safeData);

        if (!updatedUser) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        const { password, ...safeUser } =
            updatedUser;

        return successResponse(
            res,
            200,
            safeUser
        );

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSettings,
    updateSettings
};