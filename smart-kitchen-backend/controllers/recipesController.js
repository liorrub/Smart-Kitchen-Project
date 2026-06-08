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

// Build a full recipe object for API responses.
// The recipe itself is stored in recipes.json,
// while its ingredients are stored in recipe_ingredients.json.
// This helper joins the recipe with its related ingredient details.
async function buildRecipeWithIngredients(recipe) {
    const recipeIngredients = await getIngredientsByRecipeId(recipe.recipeId);

    const ingredients = await Promise.all(
        recipeIngredients.map(async (recipeIngredient) => {
            const ingredient = await getIngredientById(recipeIngredient.ingredientId);

            if (!ingredient) {
                return {
                    recipeIngredientId: recipeIngredient.recipeIngredientId,
                    ingredientId: recipeIngredient.ingredientId,
                    name: "Unknown ingredient",
                    quantity: recipeIngredient.quantity,
                    unit: recipeIngredient.unit
                };
            }

            return {
                recipeIngredientId: recipeIngredient.recipeIngredientId,
                ingredientId: ingredient.ingredientId,
                name: ingredient.name,
                category: ingredient.category,
                isAllergen: ingredient.isAllergen,
                quantity: recipeIngredient.quantity,
                unit: recipeIngredient.unit
            };
        })
    );

    return {
        ...recipe,
        ingredients
    };
}

// Add ingredient relations for a recipe.
// This does not save ingredients inside the recipe object.
// Instead, it creates rows in the recipe_ingredients relation data.
async function addIngredientsToRecipe(recipeId, ingredients) {
    await Promise.all(
        ingredients.map(async (ingredient) => {
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
            });
        })
    );
}

// Replace the full ingredient list of a recipe.
// Used when a chef/admin updates the ingredients of an existing recipe.
// First deletes the old relations, then creates the new relations.
async function replaceRecipeIngredients(recipeId, ingredients) {
    await deleteIngredientsByRecipeId(recipeId);
    await addIngredientsToRecipe(recipeId, ingredients);
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
        // Make sure the recipe creator exists before creating the recipe
        const creator = await getUserById(req.body.creatorId);

        if (!creator) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "Creator user not found");
        }

        // Keep ingredients separate from recipeData.
        // Recipe fields are saved in recipes.json,
        // while ingredients are saved in recipe_ingredients.json.
        const { ingredients, ...recipeData } = req.body;

        const recipe = await createRecipe(recipeData);
        await addIngredientsToRecipe(recipe.recipeId, ingredients);
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
        // If ingredients are provided, they will update the recipe_ingredients relation data.
        const { ingredients, ...recipeData } = req.body;
        const updatedRecipe = await updateRecipe(recipeId, recipeData);

        if (!updatedRecipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        if (ingredients !== undefined) {
            await replaceRecipeIngredients(recipeId, ingredient);
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