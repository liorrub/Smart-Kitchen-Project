"use strict";

const favoritesData = require("../data/favorites.json");

module.exports = {
    async up(queryInterface, Sequelize) {
        const rows = favoritesData.map(favorite => ({
            favoriteId: favorite.favoriteId,
            userId:     favorite.userId,
            recipeId:   favorite.recipeId,
            createdAt:  new Date(favorite.createdAt),
            updatedAt:  new Date(favorite.createdAt)
        }));

        await queryInterface.bulkInsert("Favorites", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = favoritesData.map(favorite => favorite.favoriteId);

        await queryInterface.bulkDelete(
            "Favorites",
            { favoriteId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
