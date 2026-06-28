const express = require("express");
const router = express.Router();

const { getSuggestedCreatorsHandler } = require("../controllers/feedCreatorsController");
const { authorize } = require("../middleware/auth");

router.get(
    "/feed/creators",
    authorize("user", "chef", "influencer", "admin"),
    getSuggestedCreatorsHandler
);

module.exports = router;
