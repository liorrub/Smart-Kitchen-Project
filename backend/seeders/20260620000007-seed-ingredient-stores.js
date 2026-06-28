"use strict";

const ingredientStoreData = require("../data/ingredient_store.json");

module.exports = {
    async up(queryInterface) {
        const rows = ingredientStoreData.map(item => ({
            ingredientStoreId: item.ingredientStoreId,
            ingredientId:      item.ingredientId,
            storeId:           item.storeId,
            price:             item.price,
            lastUpdated:       new Date(item.lastUpdated)
        }));

        await queryInterface.bulkInsert("IngredientStores", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = ingredientStoreData.map(item => item.ingredientStoreId);

        await queryInterface.bulkDelete(
            "IngredientStores",
            { ingredientStoreId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
