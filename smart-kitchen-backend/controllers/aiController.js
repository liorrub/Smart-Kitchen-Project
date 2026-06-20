"use strict";

// AI controller — handles all three AI features.
// Each function builds a structured Gemini prompt, parses the JSON response,
// saves the result to AiHistory, and returns it to the frontend.
// The Gemini API key never leaves the backend.

const { getUserHistory, getHistoryById, addHistory, deleteHistory } = require("../models/aiHistoryModel");
const { getUserById } = require("../models/usersModel");
const { callGeminiJSON } = require("../services/geminiService");
const { successResponse, errorResponse } = require("../utils/responseHelper");

// Builds the generate-recipe prompt from selected ingredients and optional constraints
function buildGenerateRecipePrompt(ingredients, constraints = {}) {
    const ingredientList = ingredients.join(", ");

    const constraintLines = [];
    if (constraints.difficulty) constraintLines.push(`- Difficulty: ${constraints.difficulty}`);
    if (constraints.prepTime)   constraintLines.push(`- Maximum preparation time: ${constraints.prepTime} minutes`);
    if (constraints.cookTime)   constraintLines.push(`- Maximum cooking time: ${constraints.cookTime} minutes`);
    if (constraints.servings)   constraintLines.push(`- Servings: ${constraints.servings}`);

    const constraintBlock = constraintLines.length
        ? `\n\nConstraints:\n${constraintLines.join("\n")}`
        : "";

    return `You are a professional chef assistant. Generate a detailed recipe using the following available ingredients.

Available ingredients: ${ingredientList}${constraintBlock}

Return ONLY a valid JSON object with this exact structure, no extra text, no markdown:
{
  "title": "Recipe Name",
  "description": "Brief 1-2 sentence description",
  "difficulty": "easy",
  "prepTime": 10,
  "cookTime": 15,
  "totalTime": 25,
  "servings": 2,
  "ingredients": [
    { "name": "ingredient name", "quantity": "2", "unit": "pieces" }
  ],
  "instructions": ["Step 1...", "Step 2..."],
  "tips": "Optional cooking tip"
}`;
}

// Builds the personalized suggestions prompt from user profile data
function buildSuggestionsPrompt(user, pantryItems = []) {
    const dietary = user.preferences?.dietary?.length
        ? user.preferences.dietary.join(", ")
        : "none specified";

    const cuisine = user.preferences?.cuisine?.length
        ? user.preferences.cuisine.join(", ")
        : "any";

    const pantryLine = pantryItems.length
        ? `\n- Available pantry items: ${pantryItems.join(", ")}`
        : "";

    return `You are a culinary recommendation assistant. Suggest 3 personalized recipe ideas.

User profile:
- Dietary restrictions: ${dietary}
- Favorite cuisines: ${cuisine}
- Cooking skill level: ${user.cookingLevel || "beginner"}${pantryLine}

Return ONLY a valid JSON array with exactly 3 items, no extra text, no markdown:
[
  {
    "title": "Recipe Name",
    "description": "2-3 sentence description",
    "cuisine": "cuisine type",
    "difficulty": "easy",
    "estimatedTime": "30 minutes",
    "mainIngredients": ["ingredient1", "ingredient2"],
    "whySuggested": "Brief reason this matches the user"
  }
]`;
}

// Builds the ingredient substitute prompt
function buildSubstitutePrompt(ingredient, context, reason) {
    const contextLine = context ? `\nRecipe context: ${context}` : "";
    const reasonLine  = reason  ? `\nReason for substitution: ${reason}` : "";

    return `You are a culinary expert specializing in ingredient substitutions.

Ingredient to substitute: ${ingredient}${contextLine}${reasonLine}

Provide 2-3 practical substitutes with clear explanations.

Return ONLY a valid JSON array, no extra text, no markdown:
[
  {
    "substitute": "Substitute name",
    "preparation": "How to prepare it (if needed)",
    "ratio": "How much to use relative to the original",
    "explanation": "Why this works",
    "bestFor": "When this substitute works best"
  }
]`;
}

// POST /users/:id/ai/generate-recipe
// Accepts: { inputData: { ingredients: [...], constraints: { difficulty, prepTime, cookTime, servings } } }
async function generateRecipe(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { ingredients = [], constraints = {} } = req.body.inputData || {};

        if (!ingredients.length) {
            return errorResponse(res, 400, "MISSING_FIELD", "At least one ingredient is required");
        }

        const prompt = buildGenerateRecipePrompt(ingredients, constraints);
        const generatedRecipe = await callGeminiJSON(prompt);

        const historyItem = await addHistory({
            userId,
            requestType: "recipe_generation",
            inputData: req.body.inputData,
            outputData: generatedRecipe
        });

        return successResponse(res, 200, {
            generatedRecipe,
            historyId: historyItem.historyId
        });
    } catch (error) {
        next(error);
    }
}

// POST /users/:id/ai/suggestions
// Accepts: { inputData: { pantryItems: [...] } } — pantryItems is optional
async function getSuggestions(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const user = await getUserById(userId);

        if (!user) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found");
        }

        const pantryItems = req.body.inputData?.pantryItems || [];
        const prompt = buildSuggestionsPrompt(user, pantryItems);
        const suggestions = await callGeminiJSON(prompt);

        const historyItem = await addHistory({
            userId,
            requestType: "suggestions",
            inputData: req.body.inputData || {},
            outputData: suggestions
        });

        return successResponse(res, 200, {
            suggestions,
            historyId: historyItem.historyId
        });
    } catch (error) {
        next(error);
    }
}

// POST /users/:id/ai/substitute
// Accepts: { inputData: { ingredient, context, reason } }
async function substituteIngredient(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { ingredient, context, reason } = req.body.inputData || {};

        if (!ingredient) {
            return errorResponse(res, 400, "MISSING_FIELD", "ingredient is required");
        }

        const prompt = buildSubstitutePrompt(ingredient, context, reason);
        const substitutes = await callGeminiJSON(prompt);

        const historyItem = await addHistory({
            userId,
            requestType: "ingredient_substitute",
            inputData: req.body.inputData,
            outputData: substitutes
        });

        return successResponse(res, 200, {
            substitutes,
            historyId: historyItem.historyId
        });
    } catch (error) {
        next(error);
    }
}

// GET /users/:id/ai/history
async function getUserHistoryList(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const history = await getUserHistory(userId);
        return successResponse(res, 200, history);
    } catch (error) {
        next(error);
    }
}

// GET /users/:id/ai/history/:historyId
async function getSingleUserHistory(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const historyId = Number(req.params.historyId);

        const item = await getHistoryById(historyId);

        if (!item || item.userId !== userId) {
            return errorResponse(res, 404, "HISTORY_NOT_FOUND", "AI history item not found");
        }

        return successResponse(res, 200, item);
    } catch (error) {
        next(error);
    }
}

// DELETE /users/:id/ai/history/:historyId
async function deleteSingleUserHistory(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const historyId = Number(req.params.historyId);

        const item = await getHistoryById(historyId);

        if (!item || item.userId !== userId) {
            return errorResponse(res, 404, "HISTORY_NOT_FOUND", "AI history item not found");
        }

        await deleteHistory(historyId);

        return successResponse(res, 200, { message: "AI history deleted successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    generateRecipe,
    getSuggestions,
    substituteIngredient,
    getUserHistory: getUserHistoryList,
    getSingleUserHistory,
    deleteSingleUserHistory
};
