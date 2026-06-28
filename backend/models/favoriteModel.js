"use strict";

const { Favorite } = require("./index");

// Strips only updatedAt — createdAt is part of the existing Favorites API contract.
function toPlain(instance) {
    const { updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

// Get all favorites for a user
async function getUserFavorites(userId) {
    const rows = await Favorite.findAll({
        where: { userId },
        order: [["favoriteId", "ASC"]]
    });
    return rows.map(toPlain);
}

// Get favorite by ID
async function getFavoriteById(favoriteId) {
    const instance = await Favorite.findByPk(favoriteId);
    return instance ? toPlain(instance) : undefined;
}

// Prevent adding the same recipe to favorites more than once
async function isFavoriteExists(userId, recipeId) {
    const instance = await Favorite.findOne({
        where: { userId, recipeId }
    });
    return instance ? toPlain(instance) : undefined;
}

// Add favorite
async function addFavorite(favoriteData) {
    const instance = await Favorite.create(favoriteData);
    return toPlain(instance);
}

// Remove favorite
async function removeFavorite(userId, recipeId) {
    const count = await Favorite.destroy({
        where: { userId, recipeId }
    });
    return count > 0;
}

module.exports = {
    getUserFavorites,
    getFavoriteById,
    isFavoriteExists,
    addFavorite,
    removeFavorite
};
