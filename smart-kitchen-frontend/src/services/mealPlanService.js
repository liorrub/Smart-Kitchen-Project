import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

export async function getUserMealPlan(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/meal-plan`,
        {
            headers: getAuthHeaders(),
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}

export async function createMealPlanItem(userId, mealData) {
    const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/meal-plan`,
        mealData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function updateMealPlanItem(userId, mealId, mealData) {
    const response = await axios.put(
        `${API_BASE_URL}/users/${userId}/meal-plan/${mealId}`,
        mealData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function deleteMealPlanItem(userId, mealId) {
    const response = await axios.delete(
        `${API_BASE_URL}/users/${userId}/meal-plan/${mealId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

// Pantry items are fetched here so MealPlanner can cross-reference available ingredients.
export async function getUserPantry(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/pantry`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function getRecipes() {
    const response = await axios.get(
        `${API_BASE_URL}/recipes`,
        {
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}
