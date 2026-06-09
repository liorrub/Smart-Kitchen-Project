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

// Submit a new chef request (any logged-in user)
router.post("/", submitChefRequest);

// Get own request status — must be declared before /:requestId
router.get("/my", getMyChefRequest);

// Get all pending requests (admin only)
router.get("/", authorize("admin"), getChefRequests);

// Approve a request (admin only)
router.put("/:requestId/approve", validateIdParam("requestId"), authorize("admin"), approveChefRequest);

// Reject a request (admin only)
router.put("/:requestId/reject", validateIdParam("requestId"), authorize("admin"), rejectChefRequest);

module.exports = router;
