const express = require("express");
const router = express.Router();

const recipesController = require("../controllers/recipesController");

const {
    authorize
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

const {
    validateRecipeCategory,
    validateDifficulty,
    validateCuisine,
    validateRecipeIngredientsRequired,
    validateRecipeIngredientsOptional
} = require("../validators/recipeValidator");

// Get all recipes
router.get(
    "/",
    recipesController.getRecipes
);

// Get single recipe
router.get(
    "/:id",
    validateIdParam(),
    recipesController.getSingleRecipe
);

// Only authenticated users can add reviews
router.post(
    "/",
    authorize("chef", "admin"),
    validateRequiredFields([
        "title",
        "instructions",
        "difficulty",
        "cuisine",
        "category",
        "creatorId",
        "ingredients"
    ]),
    validateDifficulty,
    validateCuisine,
    validateRecipeCategory,
    validateRecipeIngredientsRequired,
    recipesController.createSingleRecipe
);

// Update recipe
router.put(
    "/:id",
    validateIdParam(),
    authorize("chef", "admin"),
    validateDifficulty,
    validateCuisine,
    validateRecipeCategory,
    validateRecipeIngredientsOptional,
    recipesController.updateSingleRecipe
);

// Delete recipe
router.delete(
    "/:id",
    validateIdParam(),
    authorize("chef", "admin"),
    recipesController.deleteSingleRecipe
);

// Get recipe reviews
router.get(
    "/:id/reviews",
    validateIdParam(),
    recipesController.getRecipeReviews
);

// Add review
router.post(
    "/:id/reviews",
    validateIdParam(),
    validateRequiredFields([
        "rating",
        "title",
        "comment"
    ]),
    authorize(
        "user",
        "chef",
        "influencer",
        "admin"
    ),
    recipesController.createRecipeReview
);

// Update review
router.put(
    "/:id/reviews/:reviewId",
    validateIdParam(),
    validateIdParam("reviewId"),
    authorize(
        "user",
        "chef",
        "influencer",
        "admin"
    ),
    recipesController.updateRecipeReview
);

// Delete review
router.delete(
    "/:id/reviews/:reviewId",
    validateIdParam(),
    validateIdParam("reviewId"),
    authorize(
        "user",
        "chef",
        "influencer",
        "admin"
    ),
    recipesController.deleteRecipeReview
);

module.exports = router;