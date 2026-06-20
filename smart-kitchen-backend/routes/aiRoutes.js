const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");

const {
    authorize,
    allowSelfOrAdmin
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

// AI endpoints available only for the current user or admin

// Generate recipe
router.post(
    "/users/:id/ai/generate-recipe",
    validateIdParam(),
    validateRequiredFields([
        "inputData"
    ]),
    allowSelfOrAdmin,
    aiController.generateRecipe
);

// Suggestions
router.post(
    "/users/:id/ai/suggestions",
    validateIdParam(),
    allowSelfOrAdmin,
    aiController.getSuggestions
);

// Ingredient substitute
router.post(
    "/users/:id/ai/substitute",
    validateIdParam(),
    validateRequiredFields(["inputData"]),
    allowSelfOrAdmin,
    aiController.substituteIngredient
);

// User history
router.get(
    "/users/:id/ai/history",
    validateIdParam(),
    allowSelfOrAdmin,
    aiController.getUserHistory
);

// Single user history item
router.get(
    "/users/:id/ai/history/:historyId",
    validateIdParam(),
    validateIdParam("historyId"),
    allowSelfOrAdmin,
    aiController.getSingleUserHistory
);

// Delete user history item
router.delete(
    "/users/:id/ai/history/:historyId",
    validateIdParam(),
    validateIdParam("historyId"),
    allowSelfOrAdmin,
    aiController.deleteSingleUserHistory
);

module.exports = router;