"use strict";

const SEEDED_RECIPE_IDS = [101, 102, 103, 104];

const RECIPES = [
    {
        recipeId:     101,
        title:        "Simple Pasta",
        instructions: "Boil water, cook pasta, add sauce.",
        difficulty:   "easy",
        cuisine:      "italian",
        category:     "dinner",
        creatorId:    1,
        prepTime:     30,
        cookTime:     20,
        totalTime:    50,
        servings:     2,
        calories:     400,
        tags:         ["quick", "easy", "vegetarian"],
        allergens:    ["gluten"]
    },
    {
        recipeId:     102,
        title:        "Tofu Stir-fry",
        instructions: "Pan-fry tofu, add veggies and sauce.",
        difficulty:   "medium",
        cuisine:      "asian",
        category:     "dinner",
        creatorId:    2,
        prepTime:     15,
        cookTime:     15,
        totalTime:    30,
        servings:     2,
        calories:     350,
        tags:         ["healthy", "vegan"],
        allergens:    ["soy"]
    },
    {
        recipeId:     103,
        title:        "Israeli Breakfast Bowl",
        instructions: "Chop vegetables, add cheese and serve.",
        difficulty:   "easy",
        cuisine:      "israeli",
        category:     "breakfast",
        creatorId:    1,
        prepTime:     10,
        cookTime:     0,
        totalTime:    10,
        servings:     2,
        calories:     280,
        tags:         ["healthy", "easy"],
        allergens:    ["dairy"]
    },
    {
        recipeId:     104,
        title:        "Protein Yogurt Snack",
        instructions: "Mix yogurt and toppings and serve cold.",
        difficulty:   "easy",
        cuisine:      "american",
        category:     "snack",
        creatorId:    1,
        prepTime:     5,
        cookTime:     0,
        totalTime:    5,
        servings:     1,
        calories:     220,
        tags:         ["healthy", "high-protein"],
        allergens:    ["dairy"]
    }
];

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const rows = RECIPES.map(recipe => ({
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
            tags:         JSON.stringify(recipe.tags),
            allergens:    JSON.stringify(recipe.allergens),
            createdAt:    now,
            updatedAt:    now
        }));

        await queryInterface.bulkInsert("Recipes", rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            "Recipes",
            { recipeId: { [Sequelize.Op.in]: SEEDED_RECIPE_IDS } },
            {}
        );
    }
};
