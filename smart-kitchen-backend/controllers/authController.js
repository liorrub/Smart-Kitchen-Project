const bcrypt = require("bcryptjs");

const {
    getUserByEmail,
    getUserById,
    createUser
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Login user
async function login(req, res, next) {
    try {
        if (!req.body.email || !req.body.password) {
            return errorResponse(
                res,
                400,
                "MISSING_FIELD",
                "Email and password are required"
            );
        }

        const user = await getUserByEmail(
            req.body.email
        );

        const passwordMatch = user && await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
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

async function register(req, res, next) {
    try {

        const existingUser =
            await getUserByEmail(
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

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = await createUser({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            userRole: "user",
            city: req.body.city,
            preferences: {
                dietary: [],
                cuisine: []
            },
            cookingLevel: req.body.cookingLevel,
            age: req.body.age
        });

        const { password, ...safeUser } =
            newUser;

        return successResponse(
            res,
            201,
            safeUser
        );

    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login,
    getCurrentUser,
    logout
};