const {
    getUserHistory,
    getHistoryById,
    addHistory,
    deleteHistory
} = require("../models/aiHistoryModel");

const {
    getUserPantry
} = require("../models/pantryModel");

const {
    getUserById
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Generate recipe
async function generateRecipe(req, res, next) {
    try {
        const userId = Number(req.params.id);

        // Mock AI recipe generation for demonstration purposes
        const generatedRecipe = {
            title: "AI Suggested Recipe",
            ingredients: req.body.inputData.ingredients,
            instructions: [
                "Mix all ingredients",
                "Cook for 20 minutes",
                "Serve and enjoy"
            ]
        };

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

// Suggestions
async function getSuggestions(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const user = await getUserById(userId);

        if (!user) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        const pantryItems = await getUserPantry(userId);

        const suggestions = [
            {
                title: "Suggested Pasta",
                basedOn: pantryItems
            }
        ];

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

// Mock AI image analysis response
async function analyzeImage(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const analysis = {
            detectedDish: "Pasta",
            suggestedRecipes: [
                "Creamy Pasta",
                "Tomato Pasta"
            ]
        };

        const historyItem = await addHistory({
            userId,
            requestType: "image_analysis",
            inputData: req.body.inputData,
            outputData: analysis
        });

        return successResponse(res, 200, {
            analysis,
            historyId: historyItem.historyId
        });
    } catch (error) {
        next(error);
    }
}

// Get one history item
async function getSingleHistory(req, res, next) {
    try {
        const historyId = Number(req.params.id);

        const item = await getHistoryById(historyId);

        if (!item) {
            return errorResponse(
                res,
                404,
                "HISTORY_NOT_FOUND",
                "AI history item not found"
            );
        }

        return successResponse(res, 200, item);
    } catch (error) {
        next(error);
    }
}

// Delete history
async function deleteSingleHistory(req, res, next) {
    try {
        const historyId = Number(req.params.id);

        const deleted = await deleteHistory(historyId);

        if (!deleted) {
            return errorResponse(
                res,
                404,
                "HISTORY_NOT_FOUND",
                "AI history item not found"
            );
        }

        return successResponse(res, 200, {
            message: "AI history deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Get user AI history
async function getUserHistoryList(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const history = await getUserHistory(userId);

        return successResponse(res, 200, history);
    } catch (error) {
        next(error);
    }
}

// Get single user history item
async function getSingleUserHistory(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const historyId = Number(req.params.historyId);

        const item = await getHistoryById(historyId);

        if (!item || item.userId !== userId) {
            return errorResponse(
                res,
                404,
                "HISTORY_NOT_FOUND",
                "AI history item not found"
            );
        }

        return successResponse(res, 200, item);
    } catch (error) {
        next(error);
    }
}

// Delete single user history item
async function deleteSingleUserHistory(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const historyId = Number(req.params.historyId);

        const item = await getHistoryById(historyId);

        if (!item || item.userId !== userId) {
            return errorResponse(
                res,
                404,
                "HISTORY_NOT_FOUND",
                "AI history item not found"
            );
        }

        await deleteHistory(historyId);

        return successResponse(res, 200, {
            message: "AI history deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    generateRecipe,
    getSuggestions,
    analyzeImage,
    getUserHistory: getUserHistoryList,
    getSingleUserHistory,
    deleteSingleUserHistory
};