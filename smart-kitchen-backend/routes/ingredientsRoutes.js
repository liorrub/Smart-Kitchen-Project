const express = require("express");
const router = express.Router();

const ingredientsController = require("../controllers/ingredientsController");

const {
    authorize
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

// Get all ingredients
router.get(
    "/",
    ingredientsController.getIngredients
);

// Get one ingredient
router.get(
    "/:id",
    validateIdParam(),
    ingredientsController.getSingleIngredient
);

// Create ingredient
router.post(
    "/",
    authorize("admin"),
    validateRequiredFields([
        "name",
        "category",
        "isAllergen"
    ]),
    ingredientsController.createSingleIngredient
);

// Update ingredient
router.put(
    "/:id",
    validateIdParam(),
    authorize("admin"),
    ingredientsController.updateSingleIngredient
);

// Delete ingredient
router.delete(
    "/:id",
    validateIdParam(),
    authorize("admin"),
    ingredientsController.deleteSingleIngredient
);

// Compare stores
router.get(
    "/:id/stores",
    validateIdParam(),
    ingredientsController.getIngredientStores
);

module.exports = router;