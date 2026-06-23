"use strict";

// Recipe comments routes
// GET    /api/recipes/:id/comments                    — public, returns all comments for a recipe
// PUT    /api/recipes/:id/comments/:commentId         — requires login, owner or admin only
// DELETE /api/recipes/:id/comments/:commentId         — requires login, owner or admin only

const express = require("express");
const router = express.Router();

const { getCommentsByRecipe, updateComment, deleteComment } = require("../controllers/recipeCommentsController");
const { authorize } = require("../middleware/auth");
const { validateIdParam } = require("../validators/commonValidator");

// Fetch comment history for a recipe (no auth required)
router.get("/:id/comments", validateIdParam(), getCommentsByRecipe);

// Edit a comment — any logged-in role may attempt; ownership is checked in the controller
router.put(
    "/:id/comments/:commentId",
    validateIdParam(),
    validateIdParam("commentId"),
    authorize("user", "chef", "influencer", "admin"),
    updateComment
);

// Delete a comment — any logged-in role may attempt; ownership is checked in the controller
router.delete(
    "/:id/comments/:commentId",
    validateIdParam(),
    validateIdParam("commentId"),
    authorize("user", "chef", "influencer", "admin"),
    deleteComment
);

module.exports = router;
