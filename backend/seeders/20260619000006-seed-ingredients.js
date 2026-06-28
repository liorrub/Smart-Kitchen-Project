"use strict";

const ingredientsData = require("../data/ingredients.json");

module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const rows = ingredientsData.map(ingredient => ({
            ingredientId: ingredient.ingredientId,
            name:         ingredient.name,
            category:     ingredient.category,
            isAllergen:   ingredient.isAllergen,
            createdAt:    now,
            updatedAt:    now
        }));
        await queryInterface.bulkInsert("Ingredients", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = ingredientsData.map(i => i.ingredientId);
        await queryInterface.bulkDelete(
            "Ingredients",
            { ingredientId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
