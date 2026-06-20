"use strict";

const { Op } = require("sequelize");
const { PantryItem } = require("./index");
const { isExpired } = require("../utils/dateHelper");

// Strips Sequelize timestamps — original Pantry API never exposed createdAt or updatedAt.
function toPlain(instance) {
    const { createdAt, updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

// Get all pantry items for a user
async function getUserPantry(userId) {
    const rows = await PantryItem.findAll({
        where: { userId },
        order: [["pantryItemId", "ASC"]]
    });
    return rows.map(toPlain);
}

// Get pantry item by ID
async function getPantryItemById(pantryItemId) {
    const instance = await PantryItem.findByPk(pantryItemId);
    return instance ? toPlain(instance) : null;
}

// Add pantry item; isExpired is computed from expiryDate at creation time.
async function addPantryItem(pantryItemData) {
    const instance = await PantryItem.create({
        ...pantryItemData,
        isExpired: isExpired(pantryItemData.expiryDate)
    });
    return toPlain(instance);
}

// Update pantry item by userId + pantryItemId; recomputes isExpired when expiryDate changes.
async function updatePantryItem(userId, pantryItemId, updatedData) {
    const instance = await PantryItem.findOne({
        where: { pantryItemId, userId }
    });

    if (!instance) {
        return null;
    }

    const finalExpiryDate = updatedData.expiryDate || instance.expiryDate;

    await instance.update({
        ...updatedData,
        isExpired: isExpired(finalExpiryDate)
    });

    return toPlain(instance);
}

// Delete pantry item by userId + pantryItemId
async function deletePantryItem(userId, pantryItemId) {
    const count = await PantryItem.destroy({
        where: { pantryItemId, userId }
    });
    return count > 0;
}

// Return only expired pantry items for shopping list generation; computed from expiryDate.
async function getExpiredItems(userId) {
    const rows = await PantryItem.findAll({
        where: {
            userId,
            expiryDate: { [Op.lt]: new Date() }
        },
        order: [["pantryItemId", "ASC"]]
    });
    return rows.map(toPlain);
}

module.exports = {
    getUserPantry,
    getPantryItemById,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    getExpiredItems
};
