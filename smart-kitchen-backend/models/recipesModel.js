const recipes = require("../data/recipes.json");

const { generateId } = require("../utils/idGenerator");

// Get all recipes
async function getAllRecipes() {
    return recipes;
}

// Get recipe by ID
async function getRecipeById(recipeId) {
    return recipes.find(
        recipe => recipe.recipeId === recipeId
    );
}

// Create recipe
async function createRecipe(recipeData) {
    const newRecipe = {
        recipeId: generateId(recipes, "recipeId"),
        ...recipeData
    };

    recipes.push(newRecipe);

    return newRecipe;
}

// Update recipe
async function updateRecipe(recipeId, updatedData) {
    const recipeIndex = recipes.findIndex(
        recipe => recipe.recipeId === recipeId
    );

    if (recipeIndex === -1) {
        return null;
    }

    recipes[recipeIndex] = {
        ...recipes[recipeIndex],
        ...updatedData
    };

    return recipes[recipeIndex];
}

// Delete recipe
async function deleteRecipe(recipeId) {
    const recipeIndex = recipes.findIndex(
        recipe => recipe.recipeId === recipeId
    );

    if (recipeIndex === -1) {
        return false;
    }

    recipes.splice(recipeIndex, 1);

    return true;
}

// Apply optional query filters when searching recipes
async function filterRecipes(filters = {}) {
    let filteredRecipes = [...recipes];

    if (filters.category) {
        filteredRecipes = filteredRecipes.filter(
            recipe => recipe.category === filters.category
        );
    }

    if (filters.cuisine) {
        filteredRecipes = filteredRecipes.filter(
            recipe => recipe.cuisine === filters.cuisine
        );
    }

    if (filters.difficulty) {
        filteredRecipes = filteredRecipes.filter(
            recipe => recipe.difficulty === filters.difficulty
        );
    }

    if (filters.creatorId) {
        filteredRecipes = filteredRecipes.filter(
            recipe =>
                recipe.creatorId === Number(filters.creatorId)
        );
    }

    return filteredRecipes;
}

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    filterRecipes
};