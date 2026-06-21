"use strict";

const {
    isLikeExists,
    addLike,
    removeLike,
    getLikedRecipeIdsByUser
} = require("../models/recipeLikeModel");

const {
    getRecipeById
} = require("../models/recipesModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Like a recipe — the caller must not already have liked it
async function likeRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userId } = req.authUser;

        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const alreadyLiked = await isLikeExists(userId, recipeId);
        if (alreadyLiked) {
            return errorResponse(res, 409, "LIKE_ALREADY_EXISTS", "You have already liked this recipe");
        }

        const like = await addLike(userId, recipeId);
        return successResponse(res, 201, like);
    } catch (error) {
        next(error);
    }
}

// Unlike a recipe
async function unlikeRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userId } = req.authUser;

        const deleted = await removeLike(userId, recipeId);
        if (!deleted) {
            return errorResponse(res, 404, "LIKE_NOT_FOUND", "Like not found");
        }

        return successResponse(res, 200, { message: "Like removed successfully" });
    } catch (error) {
        next(error);
    }
}

// Return the list of recipe IDs liked by a specific user
async function getUserLikes(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const likedRecipeIds = await getLikedRecipeIdsByUser(userId);
        return successResponse(res, 200, likedRecipeIds);
    } catch (error) {
        next(error);
    }
}

module.exports = { likeRecipe, unlikeRecipe, getUserLikes };
