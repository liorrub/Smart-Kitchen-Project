const { successResponse } = require("../utils/responseHelper");
const recipeEnums = require("../../data/Enums/recipeEnums");
const pantryEnums = require("../../data/Enums/pantryEnums");
const usersEnums = require("../../data/Enums/usersEnums");
const mealPlanEnums = require("../../data/Enums/mealPlanEnums");
const aiEnums = require("../../data/Enums/aiEnums");

async function getOptions(req, res, next) {
    try {
        return successResponse(res, 200, {
            recipes: recipeEnums,
            pantry: pantryEnums,
            users: usersEnums,
            mealPlan: mealPlanEnums,
            ai: aiEnums
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getOptions };
