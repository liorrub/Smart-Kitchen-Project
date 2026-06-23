"use strict";

const express = require("express");
const router  = express.Router();

const { getFeed } = require("../controllers/userFollowsController");
const { requireAuth } = require("../middleware/auth");

// GET /api/feed — authenticated user's recipe feed from followed creators
router.get("/feed", requireAuth, getFeed);

module.exports = router;
