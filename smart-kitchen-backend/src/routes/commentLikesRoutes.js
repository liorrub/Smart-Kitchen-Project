"use strict";

const express = require("express");
const router = express.Router();

const { likeComment, unlikeComment } = require("../controllers/commentLikesController");
const { requireAuth } = require("../middleware/auth");
const { validateIdParam } = require("../validators/commonValidator");

// POST /api/comments/:commentId/likes — like a comment (authenticated)
router.post(
    "/comments/:commentId/likes",
    validateIdParam("commentId"),
    requireAuth,
    likeComment
);

// DELETE /api/comments/:commentId/likes — unlike a comment (authenticated)
router.delete(
    "/comments/:commentId/likes",
    validateIdParam("commentId"),
    requireAuth,
    unlikeComment
);

module.exports = router;
