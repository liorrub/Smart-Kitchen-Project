const {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    filterRecipes
} = require("../models/recipesModel");

const {
    getReviewsByRecipeId,
    getReviewById,
    addReview,
    updateReview,
    deleteReview
} = require("../models/reviewsModel");

const {
    getUserById
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get all recipes
async function getRecipes(req, res, next) {
    try {
        const filters = req.query;

        const recipes = Object.keys(filters).length
            ? await filterRecipes(filters)
            : await getAllRecipes();

        return successResponse(res, 200, recipes);
    } catch (error) {
        next(error);
    }
}

// Get one recipe
async function getSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        return successResponse(res, 200, recipe);
    } catch (error) {
        next(error);
    }
}

// Create recipe
async function createSingleRecipe(req, res, next) {
    try {
        // Make sure the recipe creator exists before creating the recipe
        const creator = await getUserById(req.body.creatorId);

        if (!creator) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "Creator user not found"
            );
        }

        const recipe = await createRecipe(req.body);

        return successResponse(res, 201, recipe);
    } catch (error) {
        next(error);
    }
}

// Update recipe
async function updateSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        const updatedRecipe = await updateRecipe(
            recipeId,
            req.body
        );

        if (!updatedRecipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        return successResponse(res, 200, updatedRecipe);
    } catch (error) {
        next(error);
    }
}

// Delete recipe
async function deleteSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        const deleted = await deleteRecipe(recipeId);

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        return successResponse(res, 200, {
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Get recipe reviews
async function getRecipeReviews(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        const reviews = await getReviewsByRecipeId(recipeId);

        return successResponse(res, 200, reviews);
    } catch (error) {
        next(error);
    }
}

// Add review
async function createRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const userId = Number(req.headers["x-user-id"]);
        const userRole = req.headers["x-user-role"];

        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        const review = await addReview({
            ...req.body,
            recipeId,
            userId,
            isInfluencer: userRole === "influencer"
        });

        return successResponse(res, 201, review);
    } catch (error) {
        next(error);
    }
}

// Update review
async function updateRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const reviewId = Number(req.params.reviewId);
        const userId = Number(req.headers["x-user-id"]);
        const userRole = req.headers["x-user-role"];

        const review = await getReviewById(reviewId);

        if (!review || review.recipeId !== recipeId) {
            return errorResponse(
                res,
                404,
                "REVIEW_NOT_FOUND",
                "Review not found"
            );
        }

        // Only the review owner or admin can update the review
        if (
            review.userId !== userId &&
            userRole !== "admin"
        ) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You can only edit your own review"
            );
        }

        const updatedReview = await updateReview(
            recipeId,
            reviewId,
            req.body
        );

        return successResponse(
            res,
            200,
            updatedReview
        );

    } catch (error) {
        next(error);
    }
}

// Delete review
async function deleteRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const reviewId = Number(req.params.reviewId);
        const userId = Number(req.headers["x-user-id"]);
        const userRole = req.headers["x-user-role"];

        const review = await getReviewById(reviewId);

        if (!review || review.recipeId !== recipeId) {
            return errorResponse(
                res,
                404,
                "REVIEW_NOT_FOUND",
                "Review not found"
            );
        }

        // Only the review owner or admin can delete the review
        if (
            review.userId !== userId &&
            userRole !== "admin"
        ) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You can only delete your own review"
            );
        }

        await deleteReview(
            recipeId,
            reviewId
        );

        return successResponse(res, 200, {
            message: "Review deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRecipes,
    getSingleRecipe,
    createSingleRecipe,
    updateSingleRecipe,
    deleteSingleRecipe,
    getRecipeReviews,
    createRecipeReview,
    updateRecipeReview,
    deleteRecipeReview
};