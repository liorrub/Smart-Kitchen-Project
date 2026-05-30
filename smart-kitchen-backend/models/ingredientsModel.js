const ingredients = require("../data/ingredients.json");

const { generateId } = require("../utils/idGenerator");

// Get all ingredients
async function getAllIngredients() {
    return ingredients;
}

// Get ingredient by ID
async function getIngredientById(ingredientId) {
    return ingredients.find(
        ingredient => ingredient.ingredientId === ingredientId
    );
}

// Create ingredient
async function createIngredient(ingredientData) {
    const newIngredient = {
        ingredientId: generateId(
            ingredients,
            "ingredientId"
        ),
        ...ingredientData
    };

    ingredients.push(newIngredient);

    return newIngredient;
}

// Update ingredient
async function updateIngredient(
    ingredientId,
    updatedData
) {
    const ingredientIndex = ingredients.findIndex(
        ingredient =>
            ingredient.ingredientId === ingredientId
    );

    if (ingredientIndex === -1) {
        return null;
    }

    ingredients[ingredientIndex] = {
        ...ingredients[ingredientIndex],
        ...updatedData
    };

    return ingredients[ingredientIndex];
}

// Delete ingredient
async function deleteIngredient(ingredientId) {
    const ingredientIndex = ingredients.findIndex(
        ingredient =>
            ingredient.ingredientId === ingredientId
    );

    if (ingredientIndex === -1) {
        return false;
    }

    ingredients.splice(ingredientIndex, 1);

    return true;
}

// Filter ingredients
async function filterIngredients(filters = {}) {
    let filteredIngredients = [...ingredients];

    if (filters.category) {
        filteredIngredients = filteredIngredients.filter(
            ingredient =>
                ingredient.category === filters.category
        );
    }

    if (filters.isAllergen !== undefined) {
        filteredIngredients = filteredIngredients.filter(
            ingredient =>
                ingredient.isAllergen ===
                (filters.isAllergen === "true")
        );
    }

    if (filters.search) {
        filteredIngredients = filteredIngredients.filter(
            ingredient =>
                ingredient.name
                    .toLowerCase()
                    .includes(filters.search.toLowerCase())
        );
    }

    return filteredIngredients;
}

module.exports = {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    filterIngredients
};