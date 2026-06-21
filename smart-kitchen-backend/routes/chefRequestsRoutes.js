const express = require("express");
const router = express.Router();

const {
    submitChefRequest,
    getChefRequests,
    getMyChefRequest,
    approveChefRequest,
    rejectChefRequest
} = require("../controllers/chefRequestsController");

const { authorize } = require("../middleware/auth");
const { validateIdParam } = require("../validators/commonValidator");

// Any authenticated user may submit a chef request or view their own.
// authorize() verifies the user exists in the DB and sets req.authUser.
// The controller then enforces business rules (chef/admin cannot submit).
router.post("/", authorize("user", "chef", "influencer", "admin"), submitChefRequest);

// Must be declared before /:requestId to avoid param shadowing.
router.get("/my", authorize("user", "chef", "influencer", "admin"), getMyChefRequest);

// Get all pending requests (admin only)
router.get("/", authorize("admin"), getChefRequests);

// Approve a request (admin only)
router.put("/:requestId/approve", validateIdParam("requestId"), authorize("admin"), approveChefRequest);

// Reject a request (admin only)
router.put("/:requestId/reject", validateIdParam("requestId"), authorize("admin"), rejectChefRequest);

module.exports = router;
