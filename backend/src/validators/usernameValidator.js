"use strict";

const { TEXT_LIMITS } = require("./textLimits");

// Username rules:
//   3–TEXT_LIMITS.username characters
//   lowercase letters, digits, underscore, period
//   must start with a letter
//   must not end with period or underscore
//   no consecutive punctuation (__ .. _. ._)
//   stored and compared as lowercase

const USERNAME_MAX = TEXT_LIMITS.username;

// Characters that count as consecutive punctuation
const CONSECUTIVE_PUNCT = /[_.][ _.]|[.][_.]|[_][.]/;

const RESERVED = new Set([
    "admin", "administrator", "root", "system", "support",
    "smartkitchen", "smart_kitchen", "api", "login",
    "register", "settings", "feed", "discover", "profile"
]);

function normalizeUsername(raw) {
    if (typeof raw !== "string") return "";
    return raw.trim().toLowerCase();
}

// Returns null if valid, or an error message string.
function validateUsername(raw) {
    const username = normalizeUsername(raw);

    if (!username) {
        return "Username is required";
    }

    if (username.length < 3) {
        return "Username must be at least 3 characters";
    }

    if (username.length > USERNAME_MAX) {
        return `Username must be at most ${USERNAME_MAX} characters`;
    }

    if (!/^[a-z]/.test(username)) {
        return "Username must start with a letter";
    }

    if (/[_.]$/.test(username)) {
        return "Username must not end with a period or underscore";
    }

    if (!/^[a-z0-9_.]+$/.test(username)) {
        return "Username may only contain letters, numbers, underscores, and periods";
    }

    if (CONSECUTIVE_PUNCT.test(username)) {
        return "Username must not contain consecutive punctuation characters";
    }

    if (RESERVED.has(username)) {
        return `"${username}" is a reserved username`;
    }

    return null;
}

// Express middleware: validates req.body.username when present.
function validateUsernameMiddleware(req, res, next) {
    const { username } = req.body;
    if (!username) return next();

    const error = validateUsername(username);
    if (error) {
        const { errorResponse } = require("../utils/responseHelper");
        return errorResponse(res, 400, "INVALID_USERNAME", error, { field: "username" });
    }

    req.body.username = normalizeUsername(username);
    next();
}

module.exports = { validateUsername, validateUsernameMiddleware, normalizeUsername };
