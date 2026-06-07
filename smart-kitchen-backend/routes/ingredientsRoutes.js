const express = require("express");
const router = express.Router();

const ingredientsController = require("../controllers/ingredientsController");

const {
    authorize
} = require("../middleware/auth");

const {
    validateIdParam
} = require("../validators/commonValidator");

const {
    validateIngredient
} = require("../validators/ingredientsValidator");

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
    validateIngredient,
    ingredientsController.createSingleIngredient
);

// Update ingredient
router.put(
    "/:id",
    validateIdParam(),
    authorize("admin"),
    validateIngredient,
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