const express = require("express");
const router = express.Router();

const {
    getMealPlan,
    getSingleMealById,
    createMeal,
    updateSingleMeal,
    deleteSingleMeal
} = require("../controllers/mealPlanController");

const {
    allowSelfOrAdmin
} = require("../middleware/auth");

const {
    validateIdParam,
    validateRequiredFields
} = require("../validators/commonValidator");

const {
    validateMealType,
    validateItemType
} = require("../validators/mealPlanValidator");

// Get full meal plan for user
router.get(
    "/:id/meal-plan",
    validateIdParam("id"),
    allowSelfOrAdmin,
    getMealPlan
);

// Get a specific meal plan item
router.get(
    "/:id/meal-plan/:mealId",
    validateIdParam("id"),
    validateIdParam("mealId"),
    allowSelfOrAdmin,
    getSingleMealById
);

// Add meal
router.post(
    "/:id/meal-plan",
    validateIdParam("id"),
    allowSelfOrAdmin,
    validateRequiredFields([
        "date",
        "mealType",
        "itemType",
        "itemId"
    ]),
    validateMealType,
    validateItemType,
    createMeal
);

// Update meal
router.put(
    "/:id/meal-plan/:mealId",
    validateIdParam("id"),
    validateIdParam("mealId"),
    allowSelfOrAdmin,
    validateMealType,
    validateItemType,
    updateSingleMeal
);

// Delete meal
router.delete(
    "/:id/meal-plan/:mealId",
    validateIdParam("id"),
    validateIdParam("mealId"),
    allowSelfOrAdmin,
    deleteSingleMeal
);

module.exports = router;