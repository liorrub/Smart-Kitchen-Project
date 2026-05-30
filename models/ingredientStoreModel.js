const ingredientStores = require("../data/ingredient_store.json");

const { generateId } = require("../utils/idGenerator");
const { getCurrentDateTime } = require("../utils/dateHelper");

// Get all ingredient-store relations
async function getAllIngredientStores() {
    return ingredientStores;
}

// Get stores for ingredient
async function getStoresByIngredientId(ingredientId) {
    return ingredientStores.filter(
        item => item.ingredientId === ingredientId
    );
}

// Get relation by ID
async function getIngredientStoreById(ingredientStoreId) {
    return ingredientStores.find(
        item => item.ingredientStoreId === ingredientStoreId
    );
}

// Add relation
async function addIngredientStore(ingredientStoreData) {
    const newEntry = {
        ingredientStoreId: generateId(
            ingredientStores,
            "ingredientStoreId"
        ),
        ...ingredientStoreData,
        lastUpdated: getCurrentDateTime()
    };

    ingredientStores.push(newEntry);

    return newEntry;
}

// Update relation
async function updateIngredientStore(
    ingredientStoreId,
    updatedData
) {
    const itemIndex = ingredientStores.findIndex(
        item => item.ingredientStoreId === ingredientStoreId
    );

    if (itemIndex === -1) {
        return null;
    }

    ingredientStores[itemIndex] = {
        ...ingredientStores[itemIndex],
        ...updatedData,
        lastUpdated: getCurrentDateTime()
    };

    return ingredientStores[itemIndex];
}

// Return stores sorted from cheapest to most expensive
async function comparePrices(ingredientId) {
    const stores = await getStoresByIngredientId(
        ingredientId
    );

    return stores.sort(
        (a, b) => a.price - b.price
    );
}

module.exports = {
    getAllIngredientStores,
    getStoresByIngredientId,
    getIngredientStoreById,
    addIngredientStore,
    updateIngredientStore,
    comparePrices
};