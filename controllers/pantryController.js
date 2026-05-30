const {
    getUserPantry,
    addPantryItem,
    updatePantryItem,
    deletePantryItem
} = require("../models/pantryModel");

const {
    getIngredientById
} = require("../models/ingredientsModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get pantry
async function getPantry(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const pantryItems = await getUserPantry(userId);

        let filteredItems = pantryItems;

        // Optional filtering for expired pantry items
        if (req.query.expired === "true") {
            filteredItems = pantryItems.filter(
                item => item.isExpired === true
            );
        }

        if (req.query.ingredientId) {
            filteredItems = filteredItems.filter(
                item =>
                    item.ingredientId ===
                    Number(req.query.ingredientId)
            );
        }

        return successResponse(res, 200, filteredItems);
    } catch (error) {
        next(error);
    }
}

// Add pantry item
async function createPantryItem(req, res, next) {
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

        const newItem = await addPantryItem({
            ...req.body,
            userId
        });

        return successResponse(res, 201, newItem);
    } catch (error) {
        next(error);
    }
}

// Update pantry item
async function updateSinglePantryItem(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const pantryItemId = Number(
            req.params.pantryItemId
        );

        if (req.body.ingredientId) {
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
        }

        const updatedItem = await updatePantryItem(
            userId,
            pantryItemId,
            req.body
        );

        if (!updatedItem) {
            return errorResponse(
                res,
                404,
                "PANTRY_ITEM_NOT_FOUND",
                "Pantry item not found"
            );
        }

        return successResponse(res, 200, updatedItem);
    } catch (error) {
        next(error);
    }
}

// Delete pantry item
async function deleteSinglePantryItem(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const pantryItemId = Number(
            req.params.pantryItemId
        );

        const deleted = await deletePantryItem(
            userId,
            pantryItemId
        );

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "PANTRY_ITEM_NOT_FOUND",
                "Pantry item not found"
            );
        }

        return successResponse(res, 200, {
            message: "Pantry item deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPantry,
    createPantryItem,
    updateSinglePantryItem,
    deleteSinglePantryItem
};