"use strict";

const { Op, Sequelize } = require("sequelize");
const { MealPlanItem, sequelize } = require("./index");

// Subquery that resolves a recipe's title for meal plan items of itemType 'recipe'.
// Returns NULL for ingredient items or when the recipe no longer exists.
const RECIPE_TITLE_SUBQUERY = sequelize.literal(
    `(SELECT title FROM Recipes WHERE Recipes.recipeId = MealPlanItem.itemId AND MealPlanItem.itemType = 'recipe')`
);

// Strips Sequelize timestamps — original Meal Plan API never exposed createdAt or updatedAt.
function toPlain(instance) {
    const { createdAt, updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

async function getUserMealPlan(userId) {
    const rows = await MealPlanItem.findAll({
        where: { userId },
        attributes: {
            include: [[RECIPE_TITLE_SUBQUERY, "recipeTitle"]]
        },
        order: [["mealId", "ASC"]]
    });
    return rows.map(toPlain);
}

async function getMealById(mealId) {
    const instance = await MealPlanItem.findByPk(mealId);
    return instance ? toPlain(instance) : undefined;
}

async function addMeal(mealData) {
    const instance = await MealPlanItem.create(mealData);
    return toPlain(instance);
}

async function updateMeal(userId, mealId, updatedData) {
    const instance = await MealPlanItem.findOne({
        where: { mealId, userId }
    });
    if (!instance) return null;
    await instance.update(updatedData);
    return toPlain(instance);
}

async function deleteMeal(userId, mealId) {
    const count = await MealPlanItem.destroy({
        where: { mealId, userId }
    });
    return count > 0;
}

// Filter by mealType and/or date prefix. Unknown query params (e.g. _t) are ignored.
async function filterMealPlan(userId, filters = {}) {
    const where = { userId };

    if (filters.mealType) {
        where.mealType = filters.mealType;
    }

    if (filters.date) {
        // DATEONLY cannot use Op.like directly — Sequelize parses the value as a date.
        // Cast the column to CHAR so MySQL performs string-prefix matching instead.
        where[Op.and] = Sequelize.where(
            Sequelize.cast(Sequelize.col("date"), "char"),
            { [Op.like]: filters.date + "%" }
        );
    }

    const rows = await MealPlanItem.findAll({
        where,
        attributes: {
            include: [[RECIPE_TITLE_SUBQUERY, "recipeTitle"]]
        },
        order: [["mealId", "ASC"]]
    });

    return rows.map(toPlain);
}

module.exports = {
    getUserMealPlan,
    getMealById,
    addMeal,
    updateMeal,
    deleteMeal,
    filterMealPlan
};
