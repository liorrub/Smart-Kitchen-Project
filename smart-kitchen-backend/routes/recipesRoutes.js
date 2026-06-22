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

const {
    validateReviewInput
} = require("../validators/reviewValidator");

// Get all approved recipes (public)
router.get(
    "/",
    recipesController.getRecipes
);

// Get the authenticated influencer's own recipes (all statuses)
router.get(
    "/my-recipes",
    authorize("influencer"),
    recipesController.getMyFoodieRecipes
);

// Get the count of pending recipes (admin only) — lightweight poll for the navbar control
router.get(
    "/pending/count",
    authorize("admin"),
    recipesController.getPendingRecipeCount
);

// Get the pending recipe queue (admin only)
router.get(
    "/pending",
    authorize("admin"),
    recipesController.getPendingQueue
);

// Get single recipe (approved = public; non-approved = creator/admin only)
router.get(
    "/:id",
    validateIdParam(),
    recipesController.getSingleRecipe
);

// Create recipe — chef and admin create approved; influencer creates pending
router.post(
    "/",
    authorize("chef", "admin", "influencer"),
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
    authorize("chef", "admin", "influencer"),
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
    authorize("chef", "admin", "influencer"),
    recipesController.deleteSingleRecipe
);

// Approve a recipe (admin only)
router.post(
    "/:id/approve",
    validateIdParam(),
    authorize("admin"),
    recipesController.approveRecipe
);

// Reject a recipe with a reason (admin only)
router.post(
    "/:id/reject",
    validateIdParam(),
    authorize("admin"),
    recipesController.rejectRecipe
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
    validateReviewInput,
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
    validateReviewInput,
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
