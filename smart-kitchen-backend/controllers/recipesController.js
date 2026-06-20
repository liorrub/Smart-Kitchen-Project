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

const {
    getIngredientsByRecipeId,
    addRecipeIngredient,
    deleteIngredientsByRecipeId
} = require("../models/recipeIngredientModel");

const {
    getIngredientById
} = require("../models/ingredientsModel");

const { sequelize } = require("../models");

async function buildRecipeWithIngredients(recipe) {
    const ingredients = await getIngredientsByRecipeId(recipe.recipeId);
    return {
        ...recipe,
        ingredients
    };
}

// Add ingredient relations for a recipe.
// Runs sequentially so a single invalid ingredientId aborts cleanly
// without leaving partial inserts behind (important when called inside a transaction).
async function addIngredientsToRecipe(recipeId, ingredients, options = {}) {
    for (const ingredient of ingredients) {
        const existingIngredient = await getIngredientById(
            Number(ingredient.ingredientId)
        );

        if (!existingIngredient) {
            const error = new Error(
                `Ingredient with id ${ingredient.ingredientId} was not found`
            );

            error.status = 404;
            error.code = "INGREDIENT_NOT_FOUND";

            throw error;
        }

        await addRecipeIngredient({
            recipeId,
            ingredientId: Number(ingredient.ingredientId),
            quantity: Number(ingredient.quantity),
            unit: ingredient.unit
        }, options);
    }
}

// Replace the full ingredient list of a recipe.
// Used when a chef/admin updates the ingredients of an existing recipe.
// First deletes the old relations, then creates the new relations.
async function replaceRecipeIngredients(recipeId, ingredients, options = {}) {
    await deleteIngredientsByRecipeId(recipeId, options);
    await addIngredientsToRecipe(recipeId, ingredients, options);
}

// Get all recipes
async function getRecipes(req, res, next) {
    try {
        const filters = req.query;
        const recipes = Object.keys(filters).length ? await filterRecipes(filters) : await getAllRecipes();

        const recipesWithIngredients = await Promise.all(
            recipes.map(recipe =>
                buildRecipeWithIngredients(recipe)));

        return successResponse(res, 200, recipesWithIngredients);
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
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const recipeWithIngredients = await buildRecipeWithIngredients(recipe);
        return successResponse(res, 200, recipeWithIngredients);

    } catch (error) {
        next(error);
    }
}

// Create recipe
async function createSingleRecipe(req, res, next) {
    try {
        // Make sure the recipe creator exists before opening a transaction.
        const creator = await getUserById(req.body.creatorId);

        if (!creator) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "Creator user not found");
        }

        // Keep ingredients separate from recipeData.
        // Both are written inside one transaction so a failed ingredient insert
        // rolls back the recipe row as well — no orphan Recipe can remain.
        const { ingredients, ...recipeData } = req.body;

        const recipe = await sequelize.transaction(async (t) => {
            const created = await createRecipe(recipeData, { transaction: t });
            await addIngredientsToRecipe(created.recipeId, ingredients, { transaction: t });
            return created;
        });

        const recipeWithIngredients = await buildRecipeWithIngredients(recipe);
        return successResponse(res, 201, recipeWithIngredients);
    } catch (error) {
        next(error);
    }
}

// Update recipe
async function updateSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        // Keep ingredients separate from recipeData.
        // When ingredients are provided, the recipe field update and the full
        // ingredient replacement run inside one transaction so a failure rolls
        // back both the field changes and the ingredient deletion/re-insertion.
        const { ingredients, ...recipeData } = req.body;

        let updatedRecipe;

        if (ingredients !== undefined) {
            updatedRecipe = await sequelize.transaction(async (t) => {
                const r = await updateRecipe(recipeId, recipeData, { transaction: t });
                if (!r) return null;
                await replaceRecipeIngredients(recipeId, ingredients, { transaction: t });
                return r;
            });
        } else {
            updatedRecipe = await updateRecipe(recipeId, recipeData);
        }

        if (!updatedRecipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        const recipeWithIngredients = await buildRecipeWithIngredients(updatedRecipe);
        return successResponse(res, 200, recipeWithIngredients);
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
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
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
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
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
        const { userId, userRole } = req.authUser;

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
        const { userId, userRole } = req.authUser;

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
            return errorResponse(res, 403, "FORBIDDEN", "You can only edit your own review");
        }

        const updatedReview = await updateReview(recipeId, reviewId, req.body);
        return successResponse(res, 200, updatedReview);

    } catch (error) {
        next(error);
    }
}

// Delete review
async function deleteRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const reviewId = Number(req.params.reviewId);
        const { userId, userRole } = req.authUser;

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
            return errorResponse(res, 403, "FORBIDDEN", "You can only delete your own review");
        }

        await deleteReview(recipeId, reviewId);
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