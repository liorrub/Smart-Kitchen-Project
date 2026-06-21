"use strict";

const recipesData = require("../data/recipes.json");

module.exports = {
    async up(queryInterface) {
        const now = new Date();
        const rows = recipesData.map(recipe => ({
            recipeId:     recipe.recipeId,
            title:        recipe.title,
            instructions: recipe.instructions,
            difficulty:   recipe.difficulty,
            cuisine:      recipe.cuisine,
            category:     recipe.category,
            creatorId:    recipe.creatorId,
            prepTime:     recipe.prepTime,
            cookTime:     recipe.cookTime,
            totalTime:    recipe.totalTime,
            servings:     recipe.servings,
            calories:     recipe.calories,
            tags:         JSON.stringify(recipe.tags || []),
            allergens:    JSON.stringify(recipe.allergens || []),
            createdAt:    now,
            updatedAt:    now
        }));
        await queryInterface.bulkInsert("Recipes", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = recipesData.map(r => r.recipeId);
        await queryInterface.bulkDelete(
            "Recipes",
            { recipeId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
