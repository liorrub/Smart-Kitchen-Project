const express = require("express");
const router = express.Router();

const usersController = require("../controllers/usersController");

const {
    authorize,
    allowSelfOrAdmin,
    allowSelfOnly
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

const {
    validateEmail,
    validatePassword,
    validateCookingLevel,
    validateUserRole
} = require("../validators/userValidator");

// Only admin can view all users
router.get(
    "/",
    authorize("admin"),
    usersController.getUsers
);

// Public user search — must be declared BEFORE /:id to avoid route conflict
router.get(
    "/search",
    usersController.searchUsers
);

// Create user
router.post(
    "/",
    authorize("admin"),
    validateRequiredFields([
        "firstName",
        "lastName",
        "email",
        "password",
        "userRole",
        "preferences",
        "cookingLevel",
        "age"
    ]),
    validateEmail,
    validatePassword,
    validateCookingLevel,
    validateUserRole,
    usersController.createSingleUser
);

// Users can access only their own profile unless they are admin
router.get(
    "/:id",
    validateIdParam(),
    allowSelfOrAdmin,
    usersController.getSingleUser
);

// Update user
router.put(
    "/:id",
    validateIdParam(),
    allowSelfOrAdmin,
    validateEmail,
    usersController.updateSingleUser
);

router.put(
    "/:id/change-password",
    validateIdParam(),
    allowSelfOnly,
    validateRequiredFields([
        "currentPassword",
        "newPassword"
    ]),
    usersController.changePassword
);

// Delete user
router.delete(
    "/:id",
    validateIdParam(),
    authorize("admin"),
    usersController.deleteSingleUser
);

// Public profile page — no auth required
router.get(
    "/:id/profile",
    validateIdParam(),
    usersController.getPublicProfile
);

module.exports = router;