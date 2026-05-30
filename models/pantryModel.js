const pantryItems = require("../data/pantry.json");

const { generateId } = require("../utils/idGenerator");
const { isExpired } = require("../utils/dateHelper");

// Get pantry for user
async function getUserPantry(userId) {
    return pantryItems.filter(
        item => item.userId === userId
    );
}

// Get pantry item by ID
async function getPantryItemById(pantryItemId) {
    return pantryItems.find(
        item => item.pantryItemId === pantryItemId
    );
}

// Automatically calculate expiration status when adding a pantry item
async function addPantryItem(pantryItemData) {
    const newPantryItem = {
        pantryItemId: generateId(
            pantryItems,
            "pantryItemId"
        ),
        ...pantryItemData,
        isExpired: isExpired(
            pantryItemData.expiryDate
        )
    };

    pantryItems.push(newPantryItem);

    return newPantryItem;
}

// Recalculate expiration status if the expiry date changes
async function updatePantryItem(
    userId,
    pantryItemId,
    updatedData
) {
    const itemIndex = pantryItems.findIndex(
        item =>
            item.pantryItemId === pantryItemId &&
            item.userId === userId
    );

    if (itemIndex === -1) {
        return null;
    }

    pantryItems[itemIndex] = {
        ...pantryItems[itemIndex],
        ...updatedData,
        isExpired: isExpired(
            updatedData.expiryDate ||
            pantryItems[itemIndex].expiryDate
        )
    };

    return pantryItems[itemIndex];
}

// Delete pantry item
async function deletePantryItem(
    userId,
    pantryItemId
) {
    const itemIndex = pantryItems.findIndex(
        item =>
            item.pantryItemId === pantryItemId &&
            item.userId === userId
    );

    if (itemIndex === -1) {
        return false;
    }

    pantryItems.splice(itemIndex, 1);

    return true;
}

// Return only expired pantry items for shopping list generation
async function getExpiredItems(userId) {
    return pantryItems.filter(
        item =>
            item.userId === userId &&
            isExpired(item.expiryDate)
    );
}

module.exports = {
    getUserPantry,
    getPantryItemById,
    addPantryItem,
    updatePantryItem,
    deletePantryItem,
    getExpiredItems
};