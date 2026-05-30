const meals = require("../data/mealPlanItem.json");

const { generateId } = require("../utils/idGenerator");

// Get meal plan for user
async function getUserMealPlan(userId) {
    return meals.filter(
        meal => meal.userId === userId
    );
}

// Get meal by ID
async function getMealById(mealId) {
    return meals.find(
        meal => meal.mealId === mealId
    );
}

// Add meal
async function addMeal(mealData) {
    const newMeal = {
        mealId: generateId(
            meals,
            "mealId"
        ),
        ...mealData
    };

    meals.push(newMeal);

    return newMeal;
}

// Update meal
async function updateMeal(
    userId,
    mealId,
    updatedData
) {
    const mealIndex = meals.findIndex(
        meal =>
            meal.mealId === mealId &&
            meal.userId === userId
    );

    if (mealIndex === -1) {
        return null;
    }

    meals[mealIndex] = {
        ...meals[mealIndex],
        ...updatedData
    };

    return meals[mealIndex];
}

// Delete meal
async function deleteMeal(
    userId,
    mealId
) {
    const mealIndex = meals.findIndex(
        meal =>
            meal.mealId === mealId &&
            meal.userId === userId
    );

    if (mealIndex === -1) {
        return false;
    }

    meals.splice(mealIndex, 1);

    return true;
}

// Filter meal plan by meal type or specific date
async function filterMealPlan(userId, filters = {}) {
    let filteredMeals = await getUserMealPlan(userId);

    if (filters.mealType) {
        filteredMeals = filteredMeals.filter(
            meal => meal.mealType === filters.mealType
        );
    }

    if (filters.date) {
        filteredMeals = filteredMeals.filter(
            meal =>
                meal.date.startsWith(filters.date)
        );
    }

    return filteredMeals;
}

module.exports = {
    getUserMealPlan,
    getMealById,
    addMeal,
    updateMeal,
    deleteMeal,
    filterMealPlan
};