const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
    validateRequiredFields,
    validateMaxLength
} = require("../validators/commonValidator");

const {
    validateEmail,
    validatePassword,
    validateCookingLevel
} = require("../validators/userValidator");
const { validateUsernameMiddleware } = require("../validators/usernameValidator");
const { validateAvatarKeyMiddleware } = require("../../data/avatarCatalog");
const { TEXT_LIMITS } = require("../validators/textLimits");

// Register
router.post(
    "/register",
    validateRequiredFields([
        "firstName",
        "lastName",
        "email",
        "password",
        "city",
        "cookingLevel",
        "age",
        "username"
    ]),
    validateEmail,
    validatePassword,
    validateCookingLevel,
    validateMaxLength({
        firstName: TEXT_LIMITS.firstName,
        lastName: TEXT_LIMITS.lastName,
        city: TEXT_LIMITS.city
    }),
    validateUsernameMiddleware,
    validateAvatarKeyMiddleware,
    authController.register
);

// Login
router.post(
    "/login",
    validateRequiredFields([
        "email",
        "password"
    ]),
    validateEmail,
    validatePassword,
    authController.login
);

// Logout
router.post(
    "/logout",
    authController.logout
);

// Return the currently authenticated user based on request headers
router.get(
    "/me",
    authController.getCurrentUser
);


module.exports = router;