const express = require("express");

const {
    validateEmail,
    validateCookingLevel
} = require("../validators/userValidator");

const router = express.Router();

const settingsController =
    require("../controllers/settingsController");

router.get(
    "/",
    settingsController.getSettings
);

router.put(
    "/",
    validateEmail,
    validateCookingLevel,
    settingsController.updateSettings
);

module.exports = router;