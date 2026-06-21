"use strict";

const { getDiscoverUsers } = require("../models/userProfileModel");

async function getDiscover(req, res, next) {
    try {
        const creators = await getDiscoverUsers();
        res.json(creators);
    } catch (err) {
        next(err);
    }
}

module.exports = { getDiscover };
