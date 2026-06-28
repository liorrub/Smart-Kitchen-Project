const express = require("express");
const router = express.Router();

const favoritesController = require("../controllers/favoritesController");

const {
    allowSelfOrAdmin
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

// Get favorites
router.get(
    "/:id/favorites",
    validateIdParam(),
    allowSelfOrAdmin,
    favoritesController.getFavorites
);

// Add favorite
router.post(
    "/:id/favorites",
    validateIdParam(),
    validateRequiredFields([
        "recipeId"
    ]),
    allowSelfOrAdmin,
    favoritesController.createFavorite
);

// Delete favorite
router.delete(
    "/:id/favorites/:recipeId",
    validateIdParam(),
    validateIdParam("recipeId"),
    allowSelfOrAdmin,
    favoritesController.deleteFavorite
);

module.exports = router;