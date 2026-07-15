const { errorResponse } = require("../utils/responseHelper");

// Validate numeric route parameter
function validateIdParam(paramName = "id") {
    return function (req, res, next) {
        const id = Number(req.params[paramName]);

        if (!req.params[paramName] || isNaN(id) || id <= 0) {
            return errorResponse(
                res,
                400,
                "INVALID_ID",
                "Invalid ID parameter",
                {
                    field: paramName
                }
            );
        }

        next();
    };
}

// Validate required fields in request body
function validateRequiredFields(requiredFields) {
    return function (req, res, next) {
        const missingFields = requiredFields.filter(
            field =>
                req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ""
        );

        if (missingFields.length > 0) {
            return errorResponse(
                res,
                400,
                "VALIDATION_ERROR",
                "Missing required fields",
                {
                    missingFields
                }
            );
        }

        next();
    };
}

// Reject request bodies whose string fields exceed a maximum length.
// `fieldLimits` maps body field name -> max character count, e.g.
//   validateMaxLength({ firstName: 30, city: 50 })
// Fields are only checked when present in the body (so this works for both
// create, where the field is required elsewhere, and partial update).
// Values are never truncated — an oversized value is rejected with 400 so
// the caller can correct it and resubmit.
function validateMaxLength(fieldLimits) {
    return function (req, res, next) {
        for (const [field, max] of Object.entries(fieldLimits)) {
            const value = req.body[field];

            if (typeof value === "string" && value.trim().length > max) {
                return errorResponse(
                    res,
                    400,
                    "VALIDATION_ERROR",
                    `${field} must be at most ${max} characters`,
                    {
                        field,
                        maxLength: max
                    }
                );
            }
        }

        next();
    };
}

module.exports = {
    validateIdParam,
    validateRequiredFields,
    validateMaxLength
};