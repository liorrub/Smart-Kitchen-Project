"use strict";

// Returns a 404 JSON response for any route that did not match
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        data: null,
        error: {
            code: "NOT_FOUND",
            message: "Route not found",
            details: {}
        }
    });
}

module.exports = notFoundHandler;
