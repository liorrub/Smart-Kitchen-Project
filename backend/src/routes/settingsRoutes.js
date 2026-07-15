const express = require("express");

const {
    validateEmail,
    validateCookingLevel
} = require("../validators/userValidator");
const { validateMaxLength } = require("../validators/commonValidator");
const { TEXT_LIMITS } = require("../validators/textLimits");

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
    validateMaxLength({
        firstName: TEXT_LIMITS.firstName,
        lastName: TEXT_LIMITS.lastName,
        city: TEXT_LIMITS.city
    }),
    settingsController.updateSettings
);

module.exports = router;