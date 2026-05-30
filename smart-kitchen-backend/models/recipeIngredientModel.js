const recipeIngredients = require("../data/recipe_ingredients.json");

const { generateId } = require("../utils/idGenerator");

// Get all recipe ingredients
async function getAllRecipeIngredients() {
    return recipeIngredients;
}

// Get ingredients for recipe
async function getIngredientsByRecipeId(recipeId) {
    return recipeIngredients.filter(
        item => item.recipeId === recipeId
    );
}

// Get recipes for ingredient
async function getRecipesByIngredientId(ingredientId) {
    return recipeIngredients.filter(
        item => item.ingredientId === ingredientId
    );
}

// Add relation
async function addRecipeIngredient(recipeIngredientData) {
    const newRecipeIngredient = {
        recipeIngredientId: generateId(
            recipeIngredients,
            "recipeIngredientId"
        ),
        ...recipeIngredientData
    };

    recipeIngredients.push(newRecipeIngredient);

    return newRecipeIngredient;
}

// Delete relation
async function deleteRecipeIngredient(
    recipeIngredientId
) {
    const itemIndex = recipeIngredients.findIndex(
        item =>
            item.recipeIngredientId ===
            recipeIngredientId
    );

    if (itemIndex === -1) {
        return false;
    }

    recipeIngredients.splice(itemIndex, 1);

    return true;
}

module.exports = {
    getAllRecipeIngredients,
    getIngredientsByRecipeId,
    getRecipesByIngredientId,
    addRecipeIngredient,
    deleteRecipeIngredient
};