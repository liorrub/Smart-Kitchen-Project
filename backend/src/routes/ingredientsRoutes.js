const express = require("express");
const router = express.Router();

const ingredientsController = require("../controllers/ingredientsController");

const {
    authorize
} = require("../middleware/auth");

const {
    validateIdParam,
    validateMaxLength
} = require("../validators/commonValidator");

const {
    validateIngredient
} = require("../validators/ingredientsValidator");

const { TEXT_LIMITS } = require("../validators/textLimits");
const ingredientNameLengthLimit = validateMaxLength({ name: TEXT_LIMITS.ingredientName });

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
    authorize("admin", "chef", "user", "influencer"),
    validateIngredient,
    ingredientNameLengthLimit,
    ingredientsController.createSingleIngredient
);

// Update ingredient
router.put(
    "/:id",
    validateIdParam(),
    authorize("admin"),
    validateIngredient,
    ingredientNameLengthLimit,
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