"use strict";

// Global error handler — must have exactly four parameters so Express treats it as error middleware
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    console.error(err);

    return res.status(500).json({
        success: false,
        data: null,
        error: {
            code: "SERVER_ERROR",
            message: "Unexpected server error",
            details: {}
        }
    });
}

module.exports = errorHandler;
