const express = require("express");
const router = express.Router();

const { getDiscover } = require("../controllers/discoverController");
const { authorize } = require("../middleware/auth");

router.get(
    "/discover",
    authorize("user", "chef", "influencer", "admin"),
    getDiscover
);

module.exports = router;
