"use strict";

// Canonical list of allowed avatarKey values.
// Each key maps to a PNG file at src/assets/avatars/<key>.png on the frontend.
// The frontend catalog mirrors this list with display metadata.

const AVATAR_KEYS = [
    "masculine",
    "feminine",
    "chef_masculine",
    "chef_feminine",
    "foodie_masculine",
    "foodie_feminine",
    "baker_masculine",
    "baker_feminine",
    "healthy_masculine",
    "healthy_feminine"
];

const AVATAR_DEFAULT = "masculine";
const AVATAR_KEY_SET = new Set(AVATAR_KEYS);

function isValidAvatarKey(key) {
    return typeof key === "string" && AVATAR_KEY_SET.has(key);
}

function validateAvatarKey(key) {
    if (!key) return null;
    if (!isValidAvatarKey(key)) {
        return `"${key}" is not a recognized avatar. Choose one of: ${AVATAR_KEYS.join(", ")}`;
    }
    return null;
}

// Express middleware: validates req.body.avatarKey when present.
function validateAvatarKeyMiddleware(req, res, next) {
    const { avatarKey } = req.body;
    if (!avatarKey) return next();

    const error = validateAvatarKey(avatarKey);
    if (error) {
        const { errorResponse } = require("../utils/responseHelper");
        return errorResponse(res, 400, "INVALID_AVATAR_KEY", error, { field: "avatarKey" });
    }

    next();
}

module.exports = {
    AVATAR_KEYS,
    AVATAR_DEFAULT,
    isValidAvatarKey,
    validateAvatarKey,
    validateAvatarKeyMiddleware
};
