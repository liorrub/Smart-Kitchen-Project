"use strict";

const { getDiscoverUsers } = require("../models/userProfileModel");

async function getDiscover(req, res, next) {
    try {
        const viewerId = req.authUser?.userId || null;
        const creators = await getDiscoverUsers(viewerId);
        res.json(creators);
    } catch (err) {
        next(err);
    }
}

module.exports = { getDiscover };
