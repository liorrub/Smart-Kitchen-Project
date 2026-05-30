const { errorResponse } = require("../utils/responseHelper");
const {
    categories,
    difficulties,
    cuisines
} = require("../data/enums/recipeEnums");

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

module.exports = {
    validateRecipeCategory,
    validateDifficulty,
    validateCuisine
};