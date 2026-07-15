// Single source of truth for user-entered text length limits.
// Mirrors backend/src/validators/textLimits.js — keep both in sync.
export const TEXT_LIMITS = {
    firstName: 10,
    lastName: 10,
    username: 25,
    city: 25,
    recipeTitle: 25,
    ingredientName: 25,
    mealPlannerNotes: 150,
    chefRequestMessage: 500
};
