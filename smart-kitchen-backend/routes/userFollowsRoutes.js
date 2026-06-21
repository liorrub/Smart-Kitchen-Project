"use strict";

const express = require("express");
const router  = express.Router();

const {
    follow,
    unfollow,
    getFollowersList,
    getFollowingList,
    getUserProfile
} = require("../controllers/userFollowsController");

const { requireAuth } = require("../middleware/auth");
const { validateIdParam } = require("../validators/commonValidator");

// Public profile for any authenticated viewer
router.get("/:id/profile",   validateIdParam(), requireAuth, getUserProfile);

// Follow relationships
router.post("/:id/follow",   validateIdParam(), requireAuth, follow);
router.delete("/:id/follow", validateIdParam(), requireAuth, unfollow);
router.get("/:id/followers", validateIdParam(), requireAuth, getFollowersList);
router.get("/:id/following", validateIdParam(), requireAuth, getFollowingList);

module.exports = router;
