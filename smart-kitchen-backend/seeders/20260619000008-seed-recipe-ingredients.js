"use strict";

const SEEDED_RECIPE_INGREDIENT_IDS = [1, 2, 3, 4, 5, 6];

const RECIPE_INGREDIENTS = [
    { recipeIngredientId: 1, recipeId: 101, ingredientId: 1,  quantity: 200, unit: "gram"  },
    { recipeIngredientId: 2, recipeId: 101, ingredientId: 3,  quantity: 100, unit: "ml"    },
    { recipeIngredientId: 3, recipeId: 102, ingredientId: 4,  quantity: 250, unit: "gram"  },
    { recipeIngredientId: 4, recipeId: 103, ingredientId: 6,  quantity: 100, unit: "gram"  },
    { recipeIngredientId: 5, recipeId: 103, ingredientId: 9,  quantity: 2,   unit: "piece" },
    { recipeIngredientId: 6, recipeId: 104, ingredientId: 10, quantity: 1,   unit: "piece" }
];

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const rows = RECIPE_INGREDIENTS.map(ri => ({
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
        await queryInterface.bulkDelete(
            "RecipeIngredients",
            { recipeIngredientId: { [Sequelize.Op.in]: SEEDED_RECIPE_INGREDIENT_IDS } },
            {}
        );
    }
};
