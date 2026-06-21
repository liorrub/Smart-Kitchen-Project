"use strict";

const { RecipeLike } = require("./index");

async function isLikeExists(userId, recipeId) {
    const instance = await RecipeLike.findOne({ where: { userId, recipeId } });
    return !!instance;
}

async function addLike(userId, recipeId) {
    const instance = await RecipeLike.create({ userId, recipeId });
    return instance.toJSON();
}

async function removeLike(userId, recipeId) {
    const count = await RecipeLike.destroy({ where: { userId, recipeId } });
    return count > 0;
}

// Returns an array of recipeId values that the user has liked
async function getLikedRecipeIdsByUser(userId) {
    const rows = await RecipeLike.findAll({
        where: { userId },
        attributes: ["recipeId"],
        order: [["likeId", "ASC"]]
    });
    return rows.map(r => r.recipeId);
}

module.exports = {
    isLikeExists,
    addLike,
    removeLike,
    getLikedRecipeIdsByUser
};
