"use strict";

const SEEDED_INGREDIENT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 999];

const INGREDIENTS = [
    { ingredientId: 1,   name: "Flour",         category: "pantry",    isAllergen: true  },
    { ingredientId: 2,   name: "Eggs",           category: "dairy",     isAllergen: true  },
    { ingredientId: 3,   name: "Tomato Sauce",   category: "pantry",    isAllergen: false },
    { ingredientId: 4,   name: "Tofu",           category: "protein",   isAllergen: true  },
    { ingredientId: 5,   name: "Milk",           category: "dairy",     isAllergen: true  },
    { ingredientId: 6,   name: "Cheese",         category: "dairy",     isAllergen: true  },
    { ingredientId: 7,   name: "Rice",           category: "pantry",    isAllergen: false },
    { ingredientId: 8,   name: "Chicken Breast", category: "protein",   isAllergen: false },
    { ingredientId: 9,   name: "Cucumber",       category: "vegetable", isAllergen: false },
    { ingredientId: 10,  name: "Yogurt",         category: "dairy",     isAllergen: true  },
    { ingredientId: 999, name: "Other",          category: "other",     isAllergen: false }
];

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const rows = INGREDIENTS.map(ingredient => ({
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
        await queryInterface.bulkDelete(
            "Ingredients",
            { ingredientId: { [Sequelize.Op.in]: SEEDED_INGREDIENT_IDS } },
            {}
        );
    }
};
