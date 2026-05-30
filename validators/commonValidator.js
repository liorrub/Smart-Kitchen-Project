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

module.exports = {
    validateIdParam,
    validateRequiredFields
};