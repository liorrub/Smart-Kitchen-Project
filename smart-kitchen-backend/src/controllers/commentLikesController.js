"use strict";

const { CommentLike, RecipeComment, sequelize } = require("../../models");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const { getIO } = require("../socket");

// Emit the updated like count to everyone viewing the recipe discussion.
// Wrapped in try/catch so a socket error never fails the REST response.
async function emitLikeUpdate(commentId, recipeId) {
    try {
        const likeCount = await CommentLike.count({ where: { commentId } });
        getIO().to(`recipe-${recipeId}`).emit("commentLikeUpdated", {
            commentId,
            recipeId,
            likeCount
        });
        return likeCount;
    } catch (err) {
        console.error("[socket] commentLikeUpdated emit failed:", err.message);
        // Fall back to a count query even if emit failed
        return CommentLike.count({ where: { commentId } });
    }
}

// POST /api/comments/:commentId/likes
// Authenticated users only. Prevents self-likes. Idempotent on duplicate.
async function likeComment(req, res, next) {
    try {
        const commentId = Number(req.params.commentId);
        const { userId } = req.authUser;

        const comment = await RecipeComment.findByPk(commentId);
        if (!comment) {
            return errorResponse(res, 404, "NOT_FOUND", "Comment not found.");
        }

        if (comment.userId === userId) {
            return errorResponse(res, 403, "SELF_LIKE_NOT_ALLOWED", "You cannot like your own comment.");
        }

        // findOrCreate is idempotent: duplicate request returns the existing row
        const [, created] = await CommentLike.findOrCreate({
            where: { userId, commentId }
        });

        const likeCount = await emitLikeUpdate(commentId, comment.recipeId);

        return successResponse(res, created ? 201 : 200, {
            commentId,
            likeCount,
            isLikedByMe: true
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/comments/:commentId/likes
// Authenticated users only. Idempotent: repeated unlike is safe.
async function unlikeComment(req, res, next) {
    try {
        const commentId = Number(req.params.commentId);
        const { userId } = req.authUser;

        const comment = await RecipeComment.findByPk(commentId);
        if (!comment) {
            return errorResponse(res, 404, "NOT_FOUND", "Comment not found.");
        }

        // destroy returns 0 if no row existed — safe to call even if not liked
        await CommentLike.destroy({ where: { userId, commentId } });

        const likeCount = await emitLikeUpdate(commentId, comment.recipeId);

        return successResponse(res, 200, {
            commentId,
            likeCount,
            isLikedByMe: false
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { likeComment, unlikeComment };
