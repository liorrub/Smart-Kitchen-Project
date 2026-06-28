"use strict";

const { IngredientStore, Store } = require("./index");

// lastUpdated (updatedAt alias) is preserved — it was exposed in the original API.
// createdAt: false in the model means it never appears in the plain object.
function toPlain(instance) {
    return instance.get({ plain: true });
}

async function getAllIngredientStores() {
    const rows = await IngredientStore.findAll({
        order: [["ingredientStoreId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getStoresByIngredientId(ingredientId) {
    const rows = await IngredientStore.findAll({
        where: { ingredientId },
        order: [["ingredientStoreId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getIngredientStoreById(ingredientStoreId) {
    const instance = await IngredientStore.findByPk(ingredientStoreId);
    return instance ? toPlain(instance) : undefined;
}

async function addIngredientStore(ingredientStoreData) {
    const instance = await IngredientStore.create(ingredientStoreData);
    return toPlain(instance);
}

async function updateIngredientStore(ingredientStoreId, updatedData) {
    const instance = await IngredientStore.findByPk(ingredientStoreId);
    if (!instance) return null;
    await instance.update(updatedData);
    return toPlain(instance);
}

// Returns stores for the ingredient sorted by price ascending.
// If city is provided, only stores in that city are returned.
async function comparePrices(ingredientId, city) {
    const storeWhere = city ? { city } : {};

    const rows = await IngredientStore.findAll({
        where: { ingredientId },
        include: [{
            model: Store,
            as: "store",
            attributes: ["name", "city", "address", "rating"],
            where: storeWhere
        }],
        order: [["price", "ASC"]]
    });
    return rows.map(toPlain);
}

module.exports = {
    getAllIngredientStores,
    getStoresByIngredientId,
    getIngredientStoreById,
    addIngredientStore,
    updateIngredientStore,
    comparePrices
};
