const {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    filterUsers
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Remove sensitive fields before returning user data
function sanitizeUser(user) {
    const { password, ...safeUser } = user;
    return safeUser;
}

// Check if it is the last admin in the system
async function isLastAdmin(userId) {
    const user = await getUserById(userId);

    if (!user || user.userRole !== "admin") {
        return false;
    }

    const users = await getAllUsers();
    const adminCount = users.filter(
        user => user.userRole === "admin"
    ).length;

    return adminCount === 1;
}

// Get all users
async function getUsers(req, res, next) {
    try {
        const filters = req.query;

        const users = Object.keys(filters).length
            ? await filterUsers(filters)
            : await getAllUsers();

        return successResponse(
            res,
            200,
            users.map(sanitizeUser)
        );
    } catch (error) {
        next(error);
    }
}

// Get single user
async function getSingleUser(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const user = await getUserById(userId);

        if (!user) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        return successResponse(
            res,
            200,
            sanitizeUser(user)
        );
    } catch (error) {
        next(error);
    }
}

// Create user
async function createSingleUser(req, res, next) {
    try {
        const existingUser = await getUserByEmail(
            req.body.email
        );

        if (existingUser) {
            return errorResponse(
                res,
                409,
                "EMAIL_ALREADY_EXISTS",
                "Email already exists"
            );
        }

        const newUser = await createUser(req.body);

        return successResponse(
            res,
            201,
            sanitizeUser(newUser)
        );
    } catch (error) {
        next(error);
    }
}

// Update user
async function updateSingleUser(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const currentUserRole = req.headers["x-user-role"];

        const currentUser = await getUserById(userId);

        if (!currentUser) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        if (req.body.userRole && currentUserRole !== "admin") {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "Only admin can change user role"
            );
        }

        if (
            req.body.userRole &&
            currentUser.userRole === "admin" &&
            req.body.userRole !== "admin" &&
            await isLastAdmin(userId)
        ) {
            return errorResponse(
                res,
                400,
                "LAST_ADMIN",
                "At least one admin must remain in the system"
            );
        }

        // Prevent assigning an email that already belongs to another user
        if (req.body.email) {
            const existingUser = await getUserByEmail(
                req.body.email
            );

            if (
                existingUser &&
                existingUser.userId !== userId
            ) {
                return errorResponse(
                    res,
                    409,
                    "EMAIL_ALREADY_EXISTS",
                    "Email already exists"
                );
            }
        }

        const {
            password,
            userId: ignoredUserId,
            createDate,
            updateDate,
            ...updateData
        } = req.body;

        const updatedUser = await updateUser(
            userId,
            updateData
        );

        if (!updatedUser) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        return successResponse(
            res,
            200,
            sanitizeUser(updatedUser)
        );

    } catch (error) {
        next(error);
    }
}

// Only user can change his password
async function changePassword(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const loggedInUserId = Number(
            req.headers["x-user-id"]
        );

        if (loggedInUserId !== userId) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You can only change your own password"
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

        if (
            user.password !== req.body.currentPassword
        ) {
            return errorResponse(
                res,
                400,
                "INVALID_PASSWORD",
                "Current password is incorrect"
            );
        }

        if (req.body.newPassword.length < 6) {
            return errorResponse(
                res,
                400,
                "INVALID_PASSWORD",
                "Password must contain at least 6 characters"
            );
        }

        if (
            req.body.currentPassword ===
            req.body.newPassword
        ) {
            return errorResponse(
                res,
                400,
                "INVALID_PASSWORD",
                "New password must be different from current password"
            );
        }

        await updateUser(
            userId,
            {
                password: req.body.newPassword
            }
        );

        return successResponse(
            res,
            200,
            {
                message:
                    "Password updated successfully"
            }
        );

    } catch (error) {
        next(error);
    }
}

// Delete user
async function deleteSingleUser(req, res, next) {
    try {
        const userId = Number(req.params.id);

        if (await isLastAdmin(userId)) {
            return errorResponse(
                res,
                400,
                "LAST_ADMIN",
                "At least one admin must remain in the system"
            );
        }
        const deleted = await deleteUser(userId);

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        return successResponse(res, 200, {
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUsers,
    getSingleUser,
    createSingleUser,
    updateSingleUser,
    changePassword,
    deleteSingleUser
};