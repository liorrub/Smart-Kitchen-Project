const favorites = require("../data/favorites.json");

const { generateId } = require("../utils/idGenerator");
const { getCurrentDateTime } = require("../utils/dateHelper");

// Get all favorites for a user
async function getUserFavorites(userId) {
    return favorites.filter(
        favorite => favorite.userId === userId
    );
}

// Get favorite by ID
async function getFavoriteById(favoriteId) {
    return favorites.find(
        favorite => favorite.favoriteId === favoriteId
    );
}

// Prevent adding the same recipe to favorites more than once
async function isFavoriteExists(userId, recipeId) {
    return favorites.find(
        favorite =>
            favorite.userId === userId &&
            favorite.recipeId === recipeId
    );
}

// Add favorite
async function addFavorite(favoriteData) {
    const newFavorite = {
        favoriteId: generateId(
            favorites,
            "favoriteId"
        ),
        ...favoriteData,
        createdAt: getCurrentDateTime()
    };

    favorites.push(newFavorite);

    return newFavorite;
}

// Remove favorite
async function removeFavorite(userId, recipeId) {
    const favoriteIndex = favorites.findIndex(
        favorite =>
            favorite.userId === userId &&
            favorite.recipeId === recipeId
    );

    if (favoriteIndex === -1) {
        return false;
    }

    favorites.splice(favoriteIndex, 1);

    return true;
}

module.exports = {
    getUserFavorites,
    getFavoriteById,
    isFavoriteExists,
    addFavorite,
    removeFavorite
};