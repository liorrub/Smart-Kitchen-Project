"use strict";

// Recipe comments controller
// Handles fetching and managing comments on a recipe's discussion.

const { Op } = require("sequelize");
const { RecipeComment, User, CommentLike, sequelize } = require("../models");
const { successResponse, errorResponse } = require("../utils/responseHelper");
const { resolveAuthUser } = require("../middleware/auth");

// Get all comments for a recipe, ordered oldest-first.
// Enriches each comment with likeCount and isLikedByMe.
// Authentication is optional — unauthenticated callers receive isLikedByMe: false.
async function getCommentsByRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);

        // Optional auth: best-effort — never rejects unauthenticated requests
        await resolveAuthUser(req).catch(() => {});

        const comments = await RecipeComment.findAll({
            where: { recipeId },
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["userId", "firstName", "lastName", "avatarKey"]
                },
                {
                    model: User,
                    as: "mentionedUser",
                    attributes: ["userId", "firstName", "lastName"]
                }
            ],
            order: [["createdAt", "ASC"]]
        });

        if (comments.length === 0) {
            return successResponse(res, 200, []);
        }

        const commentIds = comments.map((c) => c.commentId);

        // Batch: count likes per comment (one query, no N+1)
        const likeCounts = await CommentLike.findAll({
            where: { commentId: { [Op.in]: commentIds } },
            attributes: [
                "commentId",
                [sequelize.fn("COUNT", sequelize.col("commentLikeId")), "likeCount"]
            ],
            group: ["commentId"],
            raw: true
        });
        const likeCountMap = {};
        likeCounts.forEach((row) => {
            likeCountMap[row.commentId] = Number(row.likeCount);
        });

        // Batch: which comments the current user has already liked
        let likedSet = new Set();
        if (req.authUser) {
            const userLikes = await CommentLike.findAll({
                where: { userId: req.authUser.userId, commentId: { [Op.in]: commentIds } },
                attributes: ["commentId"],
                raw: true
            });
            likedSet = new Set(userLikes.map((l) => l.commentId));
        }

        const enriched = comments.map((c) => ({
            ...c.toJSON(),
            likeCount: likeCountMap[c.commentId] || 0,
            isLikedByMe: likedSet.has(c.commentId)
        }));

        return successResponse(res, 200, enriched);
    } catch (error) {
        next(error);
    }
}

// Update the content of a comment only if the caller is the owner or an admin.
async function updateComment(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const commentId = Number(req.params.commentId);
        const { content } = req.body;

        if (!content || !String(content).trim()) {
            return errorResponse(res, 400, "VALIDATION_ERROR", "Content is required.");
        }

        const comment = await RecipeComment.findOne({ where: { commentId, recipeId } });

        if (!comment) {
            return errorResponse(res, 404, "NOT_FOUND", "Comment not found.");
        }

        const authUser = req.authUser;

        if (authUser.userRole !== "admin" && authUser.userId !== comment.userId) {
            return errorResponse(
                res,
                403,
                "FORBIDDEN",
                "You do not have permission to edit this comment."
            );
        }

        await comment.update({ content: String(content).trim() });
        return successResponse(res, 200, comment);
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

module.exports = { getCommentsByRecipe, updateComment, deleteComment };
