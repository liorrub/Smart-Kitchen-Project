const {
    getUserShoppingList,
    addShoppingItem,
    updateShoppingItem,
    deleteShoppingItem,
    addGeneratedItems
} = require("../../models/shoppingListModel");

const {
    getExpiredItems
} = require("../../models/pantryModel");

const {
    comparePrices
} = require("../../models/ingredientStoreModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

const {
    getIngredientById
} = require("../../models/ingredientsModel");

const {
    getUserById
} = require("../../models/usersModel");

// Get shopping list
async function getShoppingList(req, res, next) {
    try {
        const userId = Number(req.params.id);

        let shoppingItems = await getUserShoppingList(userId);

        // Optional filtering by completion status
        if (req.query.completed) {
            const completed =
                req.query.completed === "true";

            shoppingItems = shoppingItems.filter(
                item => item.completed === completed
            );
        }

        return successResponse(res, 200, shoppingItems);
    } catch (error) {
        next(error);
    }
}

// Add shopping item
async function createShoppingItem(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const ingredient = await getIngredientById(
            req.body.ingredientId
        );

        if (!ingredient) {
            return errorResponse(
                res,
                404,
                "INGREDIENT_NOT_FOUND",
                "Ingredient not found"
            );
        }

        const newItem = await addShoppingItem({
            ...req.body,
            userId
        });

        return successResponse(res, 201, newItem);
    } catch (error) {
        next(error);
    }
}

// Update shopping item
async function updateSingleShoppingItem(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const itemId = Number(req.params.itemId);

        const updatedItem = await updateShoppingItem(
            userId,
            itemId,
            req.body
        );

        if (!updatedItem) {
            return errorResponse(
                res,
                404,
                "SHOPPING_ITEM_NOT_FOUND",
                "Shopping item not found"
            );
        }

        return successResponse(res, 200, updatedItem);
    } catch (error) {
        next(error);
    }
}

// Delete shopping item
async function deleteSingleShoppingItem(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const itemId = Number(req.params.itemId);

        const deleted = await deleteShoppingItem(
            userId,
            itemId
        );

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "SHOPPING_ITEM_NOT_FOUND",
                "Shopping item not found"
            );
        }

        return successResponse(res, 200, {
            message: "Shopping item deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Generate shopping list
async function generateShoppingList(req, res, next) {
    try {
        const userId = Number(req.params.id);

        // Generate shopping items automatically from expired pantry products
        const expiredItems = await getExpiredItems(
            userId
        );

        const generatedItems = await addGeneratedItems(
            userId,
            expiredItems
        );

        return successResponse(res, 200, generatedItems);
    } catch (error) {
        next(error);
    }
}

// Store recommendations filtered by the user's city
async function getStoreRecommendations(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const user = await getUserById(userId);
        const city = user?.city || null;

        if (!city) {
            return errorResponse(
                res,
                400,
                "NO_CITY",
                "User has no city configured"
            );
        }

        const shoppingItems =
            await getUserShoppingList(userId);

        const recommendations = [];

        for (const item of shoppingItems) {
            const stores = await comparePrices(
                item.ingredientId,
                city
            );

            recommendations.push({
                ingredientId: item.ingredientId,
                stores
            });
        }

        return successResponse(res, 200, recommendations);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getShoppingList,
    createShoppingItem,
    updateSingleShoppingItem,
    deleteSingleShoppingItem,
    generateShoppingList,
    getStoreRecommendations
};