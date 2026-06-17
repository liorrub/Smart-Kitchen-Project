import axios from "axios";

import { getResponseData } from "../utils/apiUtils";

const BASE_URL = "http://localhost:3000/api";

function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

function getAuthHeaders() {
    const storedUser = getStoredUser();

    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole || storedUser?.role
    };
}

export async function getUserMealPlan(userId) {
    const response = await axios.get(
        `${BASE_URL}/users/${userId}/meal-plan`,
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
        `${BASE_URL}/users/${userId}/meal-plan`,
        mealData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function updateMealPlanItem(userId, mealId, mealData) {
    const response = await axios.put(
        `${BASE_URL}/users/${userId}/meal-plan/${mealId}`,
        mealData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function deleteMealPlanItem(userId, mealId) {
    const response = await axios.delete(
        `${BASE_URL}/users/${userId}/meal-plan/${mealId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function getUserPantry(userId) {
    const response = await axios.get(
        `${BASE_URL}/users/${userId}/pantry`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function getRecipes() {
    const response = await axios.get(
        `${BASE_URL}/recipes`,
        {
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}
