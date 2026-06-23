const { errorResponse } = require("../utils/responseHelper");
const { categories, difficulties, cuisines } = require("../../data/Enums/recipeEnums");

// Validate recipe category
function validateRecipeCategory(req, res, next) {
    const { category } = req.body;

    if (category && !categories.includes(category)) {
        return errorResponse(
            res,
            400,
            "INVALID_CATEGORY",
            "Invalid recipe category",
            {
                field: "category"
            }
        );
    }
    next();
}

// Validate recipe difficulty
function validateDifficulty(req, res, next) {
    const { difficulty } = req.body;

    if (
        difficulty &&
        !difficulties.includes(difficulty)
    ) {
        return errorResponse(
            res,
            400,
            "INVALID_DIFFICULTY",
            "Invalid difficulty level",
            {
                field: "difficulty"
            }
        );
    }

    next();
}

// Validate cuisine
function validateCuisine(req, res, next) {
    const { cuisine } = req.body;

    if (
        cuisine &&
        !cuisines.includes(cuisine)
    ) {
        return errorResponse(
            res,
            400,
            "INVALID_CUISINE",
            "Invalid cuisine",
            {
                field: "cuisine"
            }
        );
    }

    next();
}

// Validate that recipe creation includes a non-empty ingredients array.
// Each ingredient must include ingredientId, quantity, and unit.
function validateRecipeIngredientsRequired(req, res, next) {
    const ingredients = req.body.ingredients;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Recipe must include at least one ingredient",
                details: {
                    field: "ingredients"
                }
            }
        });
    }

    return validateRecipeIngredientsContent(req, res, next);
}

// Validate ingredients only if they were provided.
// Used for updating recipe ingredients.
function validateRecipeIngredientsOptional(req, res, next) {
    if (req.body.ingredients === undefined) {
        return next();
    }
    return validateRecipeIngredientsContent(req, res, next);
}

// Shared validation for recipe ingredients array.
function validateRecipeIngredientsContent(req, res, next) {
    const ingredients = req.body.ingredients;

    if (!Array.isArray(ingredients)) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Ingredients must be an array",
                details: {
                    field: "ingredients"
                }
            }
        });
    }

    if (ingredients.length === 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Recipe must include at least one ingredient",
                details: {
                    field: "ingredients"
                }
            }
        });
    }

    for (const ingredient of ingredients) {
        if (
            ingredient.ingredientId === undefined ||
            ingredient.quantity === undefined ||
            ingredient.unit === undefined
        ) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Each recipe ingredient must include ingredientId, quantity, and unit",
                    details: {
                        requiredFields: [
                            "ingredientId",
                            "quantity",
                            "unit"
                        ]
                    }
                }
            });
        }

        if (Number.isNaN(Number(ingredient.ingredientId))) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "ingredientId must be a valid number",
                    details: {
                        field: "ingredientId"
                    }
                }
            });
        }

        if (Number.isNaN(Number(ingredient.quantity)) || Number(ingredient.quantity) <= 0) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "quantity must be a positive number",
                    details: {
                        field: "quantity"
                    }
                }
            });
        }

        if (typeof ingredient.unit !== "string" || ingredient.unit.trim() === "") {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "unit must be a non-empty string",
                    details: {
                        field: "unit"
                    }
                }
            });
        }
    }
    next();
}

module.exports = {
    validateRecipeCategory,
    validateDifficulty,
    validateCuisine,
    validateRecipeIngredientsRequired,
    validateRecipeIngredientsOptional
};