"use strict";

const { errorResponse } = require("../utils/responseHelper");

// Validate review input fields that are present in the request body.
// Used for both POST (all three required) and PUT (any subset, all optional).
// Rating must be an integer from 1 to 5.
// Title and comment must be non-empty after trimming whitespace.
function validateReviewInput(req, res, next) {
    const { rating, title, comment } = req.body;
    const errors = [];

    if (rating !== undefined) {
        const num = Number(rating);
        if (!Number.isInteger(num) || num < 1 || num > 5) {
            errors.push({
                field: "rating",
                message: "Rating must be an integer from 1 to 5"
            });
        }
    }

    if (title !== undefined) {
        if (typeof title !== "string" || title.trim() === "") {
            errors.push({
                field: "title",
                message: "Title must be a non-empty string"
            });
        }
    }

    if (comment !== undefined) {
        if (typeof comment !== "string" || comment.trim() === "") {
            errors.push({
                field: "comment",
                message: "Comment must be a non-empty string"
            });
        }
    }

    if (errors.length > 0) {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Invalid review input",
            { errors }
        );
    }

    next();
}

module.exports = { validateReviewInput };
