const { errorResponse } = require("../utils/responseHelper");
const { roles, cookingLevels } = require("../../data/Enums/usersEnums");

// Validate user role
function validateUserRole(req, res, next) {
    const { userRole } = req.body;

    if (userRole && !roles.includes(userRole)) {
        return errorResponse(
            res,
            400,
            "INVALID_ROLE",
            "Invalid user role",
            {
                field: "userRole"
            }
        );
    }

    next();
}

// Validate cooking level
function validateCookingLevel(req, res, next) {
    const { cookingLevel } = req.body;

    if (
        cookingLevel &&
        !cookingLevels.includes(cookingLevel)
    ) {
        return errorResponse(
            res,
            400,
            "INVALID_COOKING_LEVEL",
            "Invalid cooking level",
            {
                field: "cookingLevel"
            }
        );
    }

    next();
}

// Validate email format
function validateEmail(req, res, next) {
    const { email } = req.body;

    if (!email) {
        return next();
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
        return errorResponse(
            res,
            400,
            "INVALID_EMAIL",
            "Invalid email format",
            {
                field: "email"
            }
        );
    }

    next();
}

// Validate password format
function validatePassword(req, res, next) {
    const { password } = req.body;

    if (!password) {
        return next();
    }

    if (password.length < 6) {
        return errorResponse(
            res,
            400,
            "INVALID_PASSWORD",
            "Password must contain at least 6 characters",
            {
                field: "password"
            }
        );
    }

    next();
}

module.exports = {
    validateUserRole,
    validateCookingLevel,
    validateEmail,
    validatePassword
};