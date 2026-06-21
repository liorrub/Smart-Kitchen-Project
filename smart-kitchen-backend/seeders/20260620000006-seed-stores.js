"use strict";

const storesData = require("../data/stores.json");

module.exports = {
    async up(queryInterface) {
        const now = new Date("2026-01-01T00:00:00Z");

        const rows = storesData.map(store => ({
            storeId:   store.storeId,
            name:      store.name,
            city:      store.city,
            address:   store.address,
            rating:    store.rating !== undefined ? store.rating : null,
            createdAt: now,
            updatedAt: now
        }));

        await queryInterface.bulkInsert("Stores", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = storesData.map(store => store.storeId);

        await queryInterface.bulkDelete(
            "Stores",
            { storeId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
