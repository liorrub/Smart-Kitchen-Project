"use strict";

// Recipe data-access layer — all queries go through the Sequelize Recipe model.
// Follows the architecture: Database → Sequelize Model → recipesModel → Controller → Route
// (Lecture 6: ORM, Model → Controller → Route)

const { Recipe, User } = require("./index");

// Return all recipes ordered by recipeId, as plain objects
async function getAllRecipes() {
    const rows = await Recipe.findAll({
        order: [["recipeId", "ASC"]]
    });
    return rows.map(r => r.toJSON());
}

// Fetch a single recipe with its creator joined via the belongsTo association.
// Returns creator.firstName / lastName so the controller never needs a second lookup.
async function getRecipeById(recipeId) {
    const instance = await Recipe.findByPk(recipeId, {
        include: [
            {
                model: User,
                as: "creator",
                attributes: ["userId", "firstName", "lastName", "userRole"]
            }
        ]
    });
    return instance ? instance.toJSON() : null;
}

// Insert a new recipe row and return it as a plain object.
// recipeId is assigned automatically by the database (AUTO_INCREMENT).
async function createRecipe(recipeData) {
    const instance = await Recipe.create(recipeData);
    return instance.toJSON();
}

// Update an existing recipe and return the updated plain object.
// Returns null if no recipe with that ID exists.
async function updateRecipe(recipeId, updatedData) {
    const instance = await Recipe.findByPk(recipeId);
    if (!instance) return null;
    await instance.update(updatedData);
    return instance.toJSON();
}

// Delete a recipe by ID. Returns true on success, false if not found.
async function deleteRecipe(recipeId) {
    const instance = await Recipe.findByPk(recipeId);
    if (!instance) return false;
    await instance.destroy();
    return true;
}

// Return recipes matching any combination of category / cuisine / difficulty / creatorId.
// All conditions are AND-ed together; omitted filters are ignored.
async function filterRecipes(filters = {}) {
    const where = {};
    if (filters.category)   where.category   = filters.category;
    if (filters.cuisine)    where.cuisine     = filters.cuisine;
    if (filters.difficulty) where.difficulty  = filters.difficulty;
    if (filters.creatorId)  where.creatorId   = Number(filters.creatorId);

    const rows = await Recipe.findAll({
        where,
        order: [["recipeId", "ASC"]]
    });
    return rows.map(r => r.toJSON());
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    filterRecipes
};
