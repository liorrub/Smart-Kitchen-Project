"use strict";

const pantryData = require("../data/pantry.json");

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date("2026-01-01T00:00:00Z");

        const rows = pantryData.map(item => ({
            pantryItemId: item.pantryItemId,
            userId:       item.userId,
            ingredientId: item.ingredientId,
            quantity:     item.quantity,
            unit:         item.unit,
            expiryDate:   new Date(item.expiryDate),
            location:     item.location,
            isExpired:    new Date(item.expiryDate) < new Date(),
            createdAt:    now,
            updatedAt:    now
        }));

        await queryInterface.bulkInsert("PantryItems", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = pantryData.map(item => item.pantryItemId);

        await queryInterface.bulkDelete(
            "PantryItems",
            { pantryItemId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
