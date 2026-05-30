const express = require("express");
const router = express.Router();

const shoppingListController = require("../controllers/shoppingListController");

const {
    allowSelfOrAdmin
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

// Get shopping list
router.get(
    "/:id/shopping-list",
    validateIdParam(),
    allowSelfOrAdmin,
    shoppingListController.getShoppingList
);

// Add shopping item
router.post(
    "/:id/shopping-list",
    validateIdParam(),
    validateRequiredFields([
        "ingredientId",
        "quantity",
        "unit"
    ]),
    allowSelfOrAdmin,
    shoppingListController.createShoppingItem
);

// Generate shopping items automatically from expired pantry products
router.post(
    "/:id/shopping-list/generate",
    validateIdParam(),
    allowSelfOrAdmin,
    shoppingListController.generateShoppingList
);

// Store recommendations
router.get(
    "/:id/shopping-list/recommendations",
    validateIdParam(),
    allowSelfOrAdmin,
    shoppingListController.getStoreRecommendations
);

// Update shopping item
router.put(
    "/:id/shopping-list/:itemId",
    validateIdParam(),
    validateIdParam("itemId"),
    allowSelfOrAdmin,
    shoppingListController.updateSingleShoppingItem
);

// Delete shopping item
router.delete(
    "/:id/shopping-list/:itemId",
    validateIdParam(),
    validateIdParam("itemId"),
    allowSelfOrAdmin,
    shoppingListController.deleteSingleShoppingItem
);

module.exports = router;