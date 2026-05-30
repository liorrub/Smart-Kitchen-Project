const {
    getAllIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    filterIngredients
} = require("../models/ingredientsModel");

const {
    comparePrices
} = require("../models/ingredientStoreModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get all ingredients
async function getIngredients(req, res, next) {
    try {
        const filters = req.query;

        const ingredients = Object.keys(filters).length
            ? await filterIngredients(filters)
            : await getAllIngredients();

        return successResponse(res, 200, ingredients);
    } catch (error) {
        next(error);
    }
}

// Get one ingredient
async function getSingleIngredient(req, res, next) {
    try {
        const ingredientId = Number(req.params.id);

        const ingredient = await getIngredientById(
            ingredientId
        );

        if (!ingredient) {
            return errorResponse(
                res,
                404,
                "INGREDIENT_NOT_FOUND",
                "Ingredient not found"
            );
        }

        return successResponse(res, 200, ingredient);
    } catch (error) {
        next(error);
    }
}

// Create ingredient
async function createSingleIngredient(req, res, next) {
    try {
        const ingredient = await createIngredient(
            req.body
        );

        return successResponse(res, 201, ingredient);
    } catch (error) {
        next(error);
    }
}

// Update ingredient
async function updateSingleIngredient(req, res, next) {
    try {
        const ingredientId = Number(req.params.id);

        const updatedIngredient = await updateIngredient(
            ingredientId,
            req.body
        );

        if (!updatedIngredient) {
            return errorResponse(
                res,
                404,
                "INGREDIENT_NOT_FOUND",
                "Ingredient not found"
            );
        }

        return successResponse(res, 200, updatedIngredient);
    } catch (error) {
        next(error);
    }
}

// Delete ingredient
async function deleteSingleIngredient(req, res, next) {
    try {
        const ingredientId = Number(req.params.id);

        const deleted = await deleteIngredient(
            ingredientId
        );

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "INGREDIENT_NOT_FOUND",
                "Ingredient not found"
            );
        }

        return successResponse(res, 200, {
            message: "Ingredient deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Compare ingredient prices
async function getIngredientStores(req, res, next) {
    try {
        const ingredientId = Number(req.params.id);

        const ingredient = await getIngredientById(
            ingredientId
        );

        if (!ingredient) {
            return errorResponse(
                res,
                404,
                "INGREDIENT_NOT_FOUND",
                "Ingredient not found"
            );
        }

        const stores = await comparePrices(
            ingredientId
        );

        return successResponse(res, 200, stores);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getIngredients,
    getSingleIngredient,
    createSingleIngredient,
    updateSingleIngredient,
    deleteSingleIngredient,
    getIngredientStores
};