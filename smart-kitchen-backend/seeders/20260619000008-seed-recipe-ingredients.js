"use strict";

const recipeIngredientsData = require("../data/recipe_ingredients.json");

module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const rows = recipeIngredientsData.map(ri => ({
            recipeIngredientId: ri.recipeIngredientId,
            recipeId:           ri.recipeId,
            ingredientId:       ri.ingredientId,
            quantity:           ri.quantity,
            unit:               ri.unit,
            createdAt:          now,
            updatedAt:          now
        }));
        await queryInterface.bulkInsert("RecipeIngredients", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = recipeIngredientsData.map(ri => ri.recipeIngredientId);
        await queryInterface.bulkDelete(
            "RecipeIngredients",
            { recipeIngredientId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
