"use strict";

const express = require("express");
const router = express.Router();

const recipeLikesController = require("../controllers/recipeLikesController");

const {
    authorize,
    allowSelfOrAdmin
} = require("../middleware/auth");

const {
    validateIdParam
} = require("../validators/commonValidator");

// GET /api/users/:id/likes — list of recipe IDs liked by a user (self or admin)
router.get(
    "/users/:id/likes",
    validateIdParam(),
    allowSelfOrAdmin,
    recipeLikesController.getUserLikes
);

// POST /api/recipes/:id/like — like a recipe (any authenticated user)
router.post(
    "/recipes/:id/like",
    validateIdParam(),
    authorize("user", "chef", "influencer", "admin"),
    recipeLikesController.likeRecipe
);

// DELETE /api/recipes/:id/like — unlike a recipe (any authenticated user)
router.delete(
    "/recipes/:id/like",
    validateIdParam(),
    authorize("user", "chef", "influencer", "admin"),
    recipeLikesController.unlikeRecipe
);

module.exports = router;
