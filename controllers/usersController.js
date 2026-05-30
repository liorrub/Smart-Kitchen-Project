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

        const updatedUser = await updateUser(
            userId,
            req.body
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

// Delete user
async function deleteSingleUser(req, res, next) {
    try {
        const userId = Number(req.params.id);

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
    deleteSingleUser
};