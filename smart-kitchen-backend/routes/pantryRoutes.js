const express = require("express");
const router = express.Router();

const pantryController = require("../controllers/pantryController");

const {
    allowSelfOrAdmin
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

// Get pantry
router.get(
    "/:id/pantry",
    validateIdParam(),
    allowSelfOrAdmin,
    pantryController.getPantry
);

// Add pantry item
router.post(
    "/:id/pantry",
    validateIdParam(),
    validateRequiredFields([
        "ingredientId",
        "quantity",
        "unit",
        "expiryDate",
        "location"
    ]),
    allowSelfOrAdmin,
    pantryController.createPantryItem
);

// Update pantry item
router.put(
    "/:id/pantry/:pantryItemId",
    validateIdParam(),
    validateIdParam("pantryItemId"),
    allowSelfOrAdmin,
    pantryController.updateSinglePantryItem
);

// Delete pantry item
router.delete(
    "/:id/pantry/:pantryItemId",
    validateIdParam(),
    allowSelfOrAdmin,
    pantryController.deleteSinglePantryItem
);

module.exports = router;