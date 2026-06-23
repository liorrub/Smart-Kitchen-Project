// Send a successful JSON response in the standard { success, data, error } shape.
function successResponse(res, statusCode, data) {
    return res.status(statusCode).json({
        success: true,
        data: data,
        error: null
    });
}

// Send an error JSON response in the standard { success, data, error } shape.
function errorResponse(
    res,
    statusCode,
    code,
    message,
    details = {}
) {
    return res.status(statusCode).json({
        success: false,
        data: null,
        error: {
            code,
            message,
            details
        }
    });
}

module.exports = {
    successResponse,
    errorResponse
};