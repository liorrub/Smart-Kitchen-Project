"use strict";

const mealPlanData = require("../data/mealPlanItem.json");

module.exports = {
    async up(queryInterface) {
        const now = new Date("2026-01-01T00:00:00Z");

        const rows = mealPlanData.map(item => ({
            mealId:   item.mealId,
            userId:   item.userId,
            date:     item.date,
            mealType: item.mealType,
            itemType: item.itemType,
            itemId:   item.itemId,
            calories: item.calories !== undefined ? item.calories : null,
            notes:    item.notes    !== undefined ? item.notes    : null,
            createdAt: now,
            updatedAt: now
        }));

        await queryInterface.bulkInsert("MealPlanItems", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = mealPlanData.map(item => item.mealId);

        await queryInterface.bulkDelete(
            "MealPlanItems",
            { mealId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
