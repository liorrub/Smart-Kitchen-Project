const {
    getUserMealPlan,
    getMealById,
    addMeal,
    updateMeal,
    deleteMeal,
    filterMealPlan
} = require("../../models/mealPlanModel");

const {
    getRecipeById
} = require("../../models/recipesModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get meal plan
async function getMealPlan(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const meals = Object.keys(req.query).length
            ? await filterMealPlan(userId, req.query)
            : await getUserMealPlan(userId);

        return successResponse(res, 200, meals);
    } catch (error) {
        next(error);
    }
}

// Add meal
async function createMeal(req, res, next) {
    try {
        const userId = Number(req.params.id);

        // Only validate recipe existence when the item is a recipe
        if (!req.body.itemType || req.body.itemType === "recipe") {
            const recipe = await getRecipeById(Number(req.body.itemId));

            if (!recipe) {
                return errorResponse(
                    res,
                    404,
                    "RECIPE_NOT_FOUND",
                    "Recipe not found"
                );
            }
        }

        const newMeal = await addMeal({
            ...req.body,
            userId
        });

        return successResponse(res, 201, newMeal);
    } catch (error) {
        next(error);
    }
}

// Update meal
async function updateSingleMeal(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const mealId = Number(req.params.mealId);

        const existingMeal = await getMealById(mealId);

        if (!existingMeal) {
            return errorResponse(
                res,
                404,
                "MEAL_NOT_FOUND",
                "Meal plan item not found"
            );
        }

        // Validate recipe existence only if a recipe reference is being changed
        if (req.body.itemId && (!req.body.itemType || req.body.itemType === "recipe")) {
            const recipe = await getRecipeById(
                Number(req.body.itemId)
            );

            if (!recipe) {
                return errorResponse(
                    res,
                    404,
                    "RECIPE_NOT_FOUND",
                    "Recipe not found"
                );
            }
        }

        const updatedMeal = await updateMeal(
            userId,
            mealId,
            req.body
        );

        if (!updatedMeal) {
            return errorResponse(
                res,
                404,
                "MEAL_NOT_FOUND",
                "Meal plan item not found"
            );
        }

        return successResponse(res, 200, updatedMeal);
    } catch (error) {
        next(error);
    }
}

async function getSingleMealById(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const mealId = Number(req.params.mealId);

        const meal = await getMealById(mealId);

        if (!meal || meal.userId !== userId) {
            return errorResponse(
                res,
                404,
                "MEAL_NOT_FOUND",
                "Meal plan item not found"
            );
        }

        return successResponse(res, 200, meal);
    } catch (error) {
        next(error);
    }
}

// Delete meal
async function deleteSingleMeal(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const mealId = Number(req.params.mealId);

        const deleted = await deleteMeal(
            userId,
            mealId
        );

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "MEAL_NOT_FOUND",
                "Meal plan item not found"
            );
        }

        return successResponse(res, 200, {
            message: "Meal plan item deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMealPlan,
    getSingleMealById,
    createMeal,
    updateSingleMeal,
    deleteSingleMeal
};