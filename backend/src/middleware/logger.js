const { getCurrentDateTime } = require("../utils/dateHelper");

function logger(req, res, next) {
    // Save the time when the request starts
    const startTime = Date.now();

    // Listen to the "finish" event that is triggered when the response is sent
    res.on("finish", () => {
        // Calculate how long the request took
        const duration = Date.now() - startTime;

        // Hide sensitive data from logs
        const requestBody =
            req.body?.password
                ? { ...req.body, password: "***" }
                : Object.keys(req.body || {}).length
                    ? req.body
                    : undefined;

        // Build a structured log object
        const log = {
            time: getCurrentDateTime(),
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            params: req.params,
            query: req.query,
            body: requestBody
        };

        console.log(JSON.stringify(log, null, 2));
    });

    next();
}

module.exports = logger;