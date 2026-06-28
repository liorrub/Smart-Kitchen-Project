const {
    getUserFavorites,
    isFavoriteExists,
    addFavorite,
    removeFavorite
} = require("../../models/favoriteModel");

const {
    getRecipeById
} = require("../../models/recipesModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get favorites
async function getFavorites(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const favorites = await getUserFavorites(userId);

        return successResponse(res, 200, favorites);
    } catch (error) {
        next(error);
    }
}

// Add favorite
async function createFavorite(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const recipeId = Number(req.body.recipeId);

        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        if (recipe.approvalStatus !== "approved") {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You can only favorite approved recipes"
            );
        }

        const exists = await isFavoriteExists(
            userId,
            recipeId
        );

        if (exists) {
            return errorResponse(
                res,
                409,
                "FAVORITE_ALREADY_EXISTS",
                "Recipe already in favorites"
            );
        }

        const favorite = await addFavorite({
            userId,
            recipeId
        });

        return successResponse(res, 201, favorite);
    } catch (error) {
        next(error);
    }
}

// Delete favorite
async function deleteFavorite(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const recipeId = Number(req.params.recipeId);

        const deleted = await removeFavorite(
            userId,
            recipeId
        );

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "FAVORITE_NOT_FOUND",
                "Favorite not found"
            );
        }

        return successResponse(res, 200, {
            message: "Favorite removed successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getFavorites,
    createFavorite,
    deleteFavorite
};