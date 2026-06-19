"use strict";

// Recipe comments controller
// Handles fetching and deleting comments on a recipe's discussion.

const { RecipeComment, User } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseHelper");

// Get all comments for a recipe, ordered oldest-first.
// Includes the author's name and the mentioned user's name (if any).
async function getCommentsByRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        const comments = await RecipeComment.findAll({
            where: { recipeId },
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["userId", "firstName", "lastName"]
                },
                {
                    model: User,
                    as: "mentionedUser",
                    attributes: ["userId", "firstName", "lastName"]
                }
            ],
            order: [["createdAt", "ASC"]]
        });

        return successResponse(res, 200, comments);
    } catch (error) {
        next(error);
    }
}

// Delete a comment only if the caller is the comment owner or an admin.
async function deleteComment(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const commentId = Number(req.params.commentId);

        const comment = await RecipeComment.findOne({
            where: { commentId, recipeId }
        });

        if (!comment) {
            return errorResponse(res, 404, "NOT_FOUND", "Comment not found.");
        }

        const authUser = req.authUser;

        if (authUser.userRole !== "admin" && authUser.userId !== comment.userId) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to delete this comment."
            );
        }

        await comment.destroy();
        return successResponse(res, 200, { commentId });
    } catch (error) {
        next(error);
    }
}

module.exports = { getCommentsByRecipe, deleteComment };
