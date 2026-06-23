const bcrypt = require("bcryptjs");

const {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    filterUsers,
    updateUserPassword
} = require("../models/usersModel");

const {
    getUserPublicProfile,
    searchPublicUsers
} = require("../models/userProfileModel");

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

        if (!req.body.password) {
            return errorResponse(
                res,
                400,
                "MISSING_FIELD",
                "Password is required"
            );
        }

        if (!req.body.username) {
            return errorResponse(
                res,
                400,
                "MISSING_FIELD",
                "Username is required"
            );
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = await createUser({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            userRole: req.body.userRole || "user",
            city: req.body.city,
            cookingLevel: req.body.cookingLevel,
            age: req.body.age,
            preferences: req.body.preferences ?? null,
            username: req.body.username,
            avatarKey: req.body.avatarKey
        });

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
        const currentUserRole = req.authUser.userRole;

        const currentUser = await getUserById(userId);

        if (!currentUser) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        // Strip immutable and sensitive fields from the update body.
        const {
            password,
            userId: ignoredUserId,
            createDate,
            updateDate,
            createdAt,
            updatedAt,
            ...updateData
        } = req.body;

        // Non-admins cannot change their own role.
        // Strip silently rather than rejecting, so a self-update that happens to
        // include the current userRole (e.g. full-object re-send from the frontend)
        // still succeeds on the other fields.
        if (currentUserRole !== "admin") {
            delete updateData.userRole;
        }

        // Admins can change a user's role, but the system must keep at least one admin.
        if (
            updateData.userRole &&
            currentUser.userRole === "admin" &&
            updateData.userRole !== "admin" &&
            await isLastAdmin(userId)
        ) {
            return errorResponse(
                res,
                400,
                "LAST_ADMIN",
                "At least one admin must remain in the system"
            );
        }

        // Prevent assigning an email that already belongs to another user.
        if (updateData.email) {
            const existingUser = await getUserByEmail(
                updateData.email
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

        const loggedInUserId = req.authUser.userId;

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

        if (!req.body.currentPassword || !req.body.newPassword) {
            return errorResponse(
                res,
                400,
                "MISSING_FIELD",
                "Current and new password are required"
            );
        }

        const passwordMatch = await bcrypt.compare(
            req.body.currentPassword,
            user.password
        );

        if (!passwordMatch) {
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

        const hashedPassword = await bcrypt.hash(
            req.body.newPassword,
            10
        );
        await updateUserPassword(userId, hashedPassword);

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

// Public profile — no auth required, but x-user-id header is read if present to compute isFollowedByMe.
async function getPublicProfile(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const viewerId = Number(req.headers["x-user-id"]) || null;

        const profile = await getUserPublicProfile(userId, viewerId);

        if (!profile) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found");
        }

        return successResponse(res, 200, profile);
    } catch (error) {
        next(error);
    }
}

// Search users by name / city / role — no auth required
async function searchUsers(req, res, next) {
    try {
        const { q = "", role = "all" } = req.query;
        const users = await searchPublicUsers(q.trim(), role);
        return successResponse(res, 200, users);
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
    deleteSingleUser,
    getPublicProfile,
    searchUsers
};