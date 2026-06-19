"use strict";

const sequelize = require("../config/database");
const User = require("./User");

// Phase 1: User only.
// Associations for other models will be added as they are migrated in later phases.

module.exports = {
    sequelize,
    User
};
