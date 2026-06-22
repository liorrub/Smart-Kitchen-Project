const express = require("express");
const router = express.Router();

const recipesController = require("../controllers/recipesController");
const { authorize } = require("../middleware/auth");
const { validateIdParam } = require("../validators/commonValidator");

// Get count of open review reports — lightweight poll for the admin navbar indicator
router.get(
    "/count",
    authorize("admin"),
    recipesController.getOpenReviewReportCount
);

// Get all review reports (optionally filtered by ?status=open|dismissed|actioned)
router.get(
    "/",
    authorize("admin"),
    recipesController.getReviewReports
);

// Update a review report's status
router.patch(
    "/:reportId",
    validateIdParam("reportId"),
    authorize("admin"),
    recipesController.updateReviewReport
);

// Delete the reviewed content through moderation (cascades to all reports and helpful votes)
router.delete(
    "/:reportId/delete-review",
    validateIdParam("reportId"),
    authorize("admin"),
    recipesController.deleteReviewThroughModeration
);

module.exports = router;
