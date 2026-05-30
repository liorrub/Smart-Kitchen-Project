const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
    validateRequiredFields
} = require("../validators/commonValidator");

const {
    validateEmail,
    validatePassword
} = require("../validators/userValidator");

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

// Return the currently authenticated user based on request headers
router.get(
    "/me",
    authController.getCurrentUser
);

module.exports = router;