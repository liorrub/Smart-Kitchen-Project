"use strict";

const express = require("express");
const router = express.Router();

const {
    getNotifications,
    getUnreadNotificationCount,
    markAllRead,
    markOneRead
} = require("../controllers/notificationsController");

const { requireAuth } = require("../middleware/auth");

// All endpoints require authentication; userId is read from req.authUser (never from body/query)
router.get("/", requireAuth, getNotifications);
router.get("/unread-count", requireAuth, getUnreadNotificationCount);

// read-all must be declared before /:id/read to avoid param shadowing
router.put("/read-all", requireAuth, markAllRead);
router.put("/:id/read", requireAuth, markOneRead);

module.exports = router;
