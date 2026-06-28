"use strict";

const { getSuggestedCreators } = require("../../models/userProfileModel");
const { successResponse } = require("../utils/responseHelper");

async function getSuggestedCreatorsHandler(req, res, next) {
    try {
        const viewerId = req.authUser?.userId || null;
        const creators = await getSuggestedCreators(viewerId);
        return successResponse(res, 200, creators);
    } catch (err) {
        next(err);
    }
}

module.exports = { getSuggestedCreatorsHandler };
