import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getStoredUser, getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

// Returns the current user's full AI request history
export async function getAIHistory() {
    const storedUser = getStoredUser();

    if (!storedUser?.userId) return [];

    const response = await axios.get(
        `${API_BASE_URL}/users/${storedUser.userId}/ai/history`,
        { headers: getAuthHeaders(), params: { _t: Date.now() } }
    );

    return getResponseData(response);
}

// Sends selected pantry ingredient names + optional constraints to the generate-recipe endpoint
export async function generateRecipeFromPantry(ingredients, constraints = {}) {
    const storedUser = getStoredUser();

    const response = await axios.post(
        `${API_BASE_URL}/users/${storedUser.userId}/ai/generate-recipe`,
        { inputData: { ingredients, constraints } },
        { headers: getAuthHeaders() }
    );

    return getResponseData(response);
}

// Requests personalized recipe suggestions based on user profile + optional pantry items
export async function getPersonalizedSuggestions(pantryItems = []) {
    const storedUser = getStoredUser();

    const response = await axios.post(
        `${API_BASE_URL}/users/${storedUser.userId}/ai/suggestions`,
        { inputData: { pantryItems } },
        { headers: getAuthHeaders() }
    );

    return getResponseData(response);
}

// Asks Gemini for substitutes for a specific ingredient
// ingredient: string (required), context: string (optional recipe name), reason: string (optional)
export async function substituteIngredient(ingredient, context = "", reason = "") {
    const storedUser = getStoredUser();

    const response = await axios.post(
        `${API_BASE_URL}/users/${storedUser.userId}/ai/substitute`,
        { inputData: { ingredient, context, reason } },
        { headers: getAuthHeaders() }
    );

    return getResponseData(response);
}

// Deletes a single AI history entry by ID
export async function deleteAIHistoryItem(historyId) {
    const storedUser = getStoredUser();

    const response = await axios.delete(
        `${API_BASE_URL}/users/${storedUser.userId}/ai/history/${historyId}`,
        { headers: getAuthHeaders() }
    );

    return getResponseData(response);
}
