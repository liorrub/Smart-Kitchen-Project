"use strict";

const { Ingredient } = require("./index");

function toPlain(instance) {
    const { createdAt, updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

async function getAllIngredients() {
    const rows = await Ingredient.findAll({
        order: [["ingredientId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getIngredientById(ingredientId) {
    const ingredient = await Ingredient.findByPk(ingredientId);
    return ingredient ? toPlain(ingredient) : null;
}

async function createIngredient(ingredientData) {
    const ingredient = await Ingredient.create(ingredientData);
    return toPlain(ingredient);
}

async function updateIngredient(ingredientId, updatedData) {
    const ingredient = await Ingredient.findByPk(ingredientId);
    if (!ingredient) return null;
    await ingredient.update(updatedData);
    return toPlain(ingredient);
}

async function deleteIngredient(ingredientId) {
    const ingredient = await Ingredient.findByPk(ingredientId);
    if (!ingredient) return false;
    await ingredient.destroy();
    return true;
}

async function filterIngredients(filters = {}) {
    const where = {};

    if (filters.category) {
        where.category = filters.category;
    }

    if (filters.isAllergen !== undefined) {
        where.isAllergen = filters.isAllergen === "true";
    }

    const rows = await Ingredient.findAll({
        where,
        order: [["ingredientId", "ASC"]]
    });

    let ingredients = rows.map(toPlain);

    if (filters.search) {
        const normalizedSearch = filters.search.toLowerCase();
        ingredients = ingredients.filter(
            ingredient =>
                ingredient.name.toLowerCase().includes(normalizedSearch)
        );
    }

    return ingredients;
}

module.exports = {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    filterIngredients
};
