"use strict";

const { ShoppingListItem } = require("./index");

// Returns all fields including createDate and updateDate — both are part of the Shopping List API contract.
function toPlain(instance) {
    return instance.get({ plain: true });
}

async function getUserShoppingList(userId) {
    const rows = await ShoppingListItem.findAll({
        where: { userId },
        order: [["shoppingItemId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getShoppingItemById(shoppingItemId) {
    const instance = await ShoppingListItem.findByPk(shoppingItemId);
    return instance ? toPlain(instance) : undefined;
}

async function addShoppingItem(shoppingItemData) {
    const instance = await ShoppingListItem.create({
        ...shoppingItemData,
        completed: false
    });
    return toPlain(instance);
}

async function updateShoppingItem(userId, shoppingItemId, updatedData) {
    const instance = await ShoppingListItem.findOne({
        where: { shoppingItemId, userId }
    });
    if (!instance) return null;
    await instance.update(updatedData);
    return toPlain(instance);
}

async function deleteShoppingItem(userId, shoppingItemId) {
    const count = await ShoppingListItem.destroy({
        where: { shoppingItemId, userId }
    });
    return count > 0;
}

async function addGeneratedItems(userId, generatedItems) {
    const instances = await ShoppingListItem.bulkCreate(
        generatedItems.map(item => ({
            userId,
            ingredientId: item.ingredientId,
            quantity:     item.quantity,
            unit:         item.unit,
            completed:    false,
            source:       "expired-pantry"
        }))
    );
    return instances.map(toPlain);
}

module.exports = {
    getUserShoppingList,
    getShoppingItemById,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    addGeneratedItems
};
