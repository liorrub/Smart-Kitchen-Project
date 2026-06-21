"use strict";

// Recipe data-access layer — all queries go through the Sequelize Recipe model.
// Follows the architecture: Database → Sequelize Model → recipesModel → Controller → Route
// (Lecture 6: ORM, Model → Controller → Route)

const { Recipe, User, sequelize } = require("./index");

// Subquery that counts public likes for each recipe row
const LIKE_COUNT_SUBQUERY = sequelize.literal(
    `(SELECT COUNT(*) FROM RecipeLikes AS rl WHERE rl.recipeId = Recipe.recipeId)`
);

// Return all recipes ordered by recipeId, as plain objects (includes public like count)
async function getAllRecipes() {
    const rows = await Recipe.findAll({
        attributes: {
            include: [[LIKE_COUNT_SUBQUERY, "likeCount"]]
        },
        order: [["recipeId", "ASC"]]
    });
    return rows.map(r => {
        const obj = r.toJSON();
        obj.likeCount = Number(obj.likeCount || 0);
        return obj;
    });
}

// Fetch a single recipe with its creator joined, plus public like count.
async function getRecipeById(recipeId) {
    const instance = await Recipe.findByPk(recipeId, {
        attributes: {
            include: [[LIKE_COUNT_SUBQUERY, "likeCount"]]
        },
        include: [
            {
                model: User,
                as: "creator",
                attributes: ["userId", "firstName", "lastName", "userRole"]
            }
        ]
    });
    if (!instance) return null;
    const obj = instance.toJSON();
    obj.likeCount = Number(obj.likeCount || 0);
    return obj;
}

// Insert a new recipe row and return it as a plain object.
// recipeId is assigned automatically by the database (AUTO_INCREMENT).
async function createRecipe(recipeData, options = {}) {
    const instance = await Recipe.create(recipeData, options);
    return instance.toJSON();
}

// Update an existing recipe and return the updated plain object.
// Returns null if no recipe with that ID exists.
async function updateRecipe(recipeId, updatedData, options = {}) {
    const instance = await Recipe.findByPk(recipeId, options);
    if (!instance) return null;
    await instance.update(updatedData, options);
    return instance.toJSON();
}

// Delete a recipe by ID. Returns true on success, false if not found.
async function deleteRecipe(recipeId, options = {}) {
    const instance = await Recipe.findByPk(recipeId, options);
    if (!instance) return false;
    await instance.destroy(options);
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
        attributes: {
            include: [[LIKE_COUNT_SUBQUERY, "likeCount"]]
        },
        where,
        order: [["recipeId", "ASC"]]
    });
    return rows.map(r => {
        const obj = r.toJSON();
        obj.likeCount = Number(obj.likeCount || 0);
        return obj;
    });
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    filterRecipes
};
