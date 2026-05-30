const shoppingItems = require("../data/shoppingList.json");

const { generateId } = require("../utils/idGenerator");

const {
    getCurrentDateTime
} = require("../utils/dateHelper");

// Get shopping list for user
async function getUserShoppingList(userId) {
    return shoppingItems.filter(
        item => item.userId === userId
    );
}

// Get shopping item by ID
async function getShoppingItemById(shoppingItemId) {
    return shoppingItems.find(
        item => item.shoppingItemId === shoppingItemId
    );
}

// Add shopping item
async function addShoppingItem(shoppingItemData) {
    const currentDate = getCurrentDateTime();

    const newShoppingItem = {
        shoppingItemId: generateId(
            shoppingItems,
            "shoppingItemId"
        ),
        ...shoppingItemData,
        completed: false,
        createDate: currentDate,
        updateDate: currentDate
    };

    shoppingItems.push(newShoppingItem);

    return newShoppingItem;
}

// Update shopping item
async function updateShoppingItem(
    userId,
    shoppingItemId,
    updatedData
) {
    const itemIndex = shoppingItems.findIndex(
        item =>
            item.shoppingItemId === shoppingItemId &&
            item.userId === userId
    );

    if (itemIndex === -1) {
        return null;
    }

    shoppingItems[itemIndex] = {
        ...shoppingItems[itemIndex],
        ...updatedData,
        updateDate: getCurrentDateTime()
    };

    return shoppingItems[itemIndex];
}

// Delete shopping item
async function deleteShoppingItem(
    userId,
    shoppingItemId
) {
    const itemIndex = shoppingItems.findIndex(
        item =>
            item.shoppingItemId === shoppingItemId &&
            item.userId === userId
    );

    if (itemIndex === -1) {
        return false;
    }

    shoppingItems.splice(itemIndex, 1);

    return true;
}

// Create shopping list items automatically from expired pantry products
async function addGeneratedItems(userId, generatedItems) {
    let nextId = generateId(
        shoppingItems,
        "shoppingItemId"
    );

    const currentDate = getCurrentDateTime();
    const newItems = generatedItems.map(item => {
        const newItem = {
            shoppingItemId: nextId,
            userId: userId,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            completed: false,
            source: "expired-pantry",
            createDate: currentDate,
            updateDate: currentDate
        };

        nextId++;

        return newItem;
    });

    shoppingItems.push(...newItems);

    return newItems;
}

module.exports = {
    getUserShoppingList,
    getShoppingItemById,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    addGeneratedItems
};