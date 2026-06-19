"use strict";

const { RecipeIngredient, Ingredient } = require("./index");

function toPlain(instance) {
    const { createdAt, updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

async function getAllRecipeIngredients() {
    const rows = await RecipeIngredient.findAll({
        order: [["recipeIngredientId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getIngredientsByRecipeId(recipeId) {
    const rows = await RecipeIngredient.findAll({
        where: { recipeId },
        attributes: [
            "recipeIngredientId",
            "ingredientId",
            "quantity",
            "unit"
        ],
        include: [
            {
                model: Ingredient,
                as: "ingredient",
                required: false,
                attributes: [
                    "ingredientId",
                    "name",
                    "category",
                    "isAllergen"
                ]
            }
        ],
        order: [
            ["recipeIngredientId", "ASC"],
            ["ingredientId", "ASC"]
        ]
    });

    return rows.map((row) => {
        const plain = row.get({ plain: true });
        const ing = plain.ingredient;

        if (!ing) {
            return {
                recipeIngredientId: plain.recipeIngredientId,
                ingredientId: plain.ingredientId,
                name: "Unknown ingredient",
                quantity: plain.quantity,
                unit: plain.unit
            };
        }

        return {
            recipeIngredientId: plain.recipeIngredientId,
            ingredientId: plain.ingredientId,
            name: ing.name,
            category: ing.category,
            isAllergen: ing.isAllergen,
            quantity: plain.quantity,
            unit: plain.unit
        };
    });
}

async function getRecipesByIngredientId(ingredientId) {
    const rows = await RecipeIngredient.findAll({
        where: { ingredientId },
        order: [["recipeIngredientId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function addRecipeIngredient(recipeIngredientData, options = {}) {
    const row = await RecipeIngredient.create(recipeIngredientData, options);
    return toPlain(row);
}

async function deleteRecipeIngredient(recipeIngredientId, options = {}) {
    const row = await RecipeIngredient.findByPk(recipeIngredientId, options);
    if (!row) return false;
    await row.destroy(options);
    return true;
}

async function deleteIngredientsByRecipeId(recipeId, options = {}) {
    await RecipeIngredient.destroy({
        ...options,
        where: { recipeId }
    });
    return true;
}

module.exports = {
    getAllRecipeIngredients,
    getIngredientsByRecipeId,
    getRecipesByIngredientId,
    addRecipeIngredient,
    deleteRecipeIngredient,
    deleteIngredientsByRecipeId
};
