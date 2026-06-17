import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getNestedResponseData } from "../utils/apiUtils";

function getAuthHeaders() {
    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole
    };
}

export async function getIngredients(headers = {}) {
    const response = await axios.get(
        `${API_BASE_URL}/ingredients`,
        { headers }
    );

    return getNestedResponseData(response);
}

export async function createIngredient(ingredientData) {
    const response = await axios.post(
        `${API_BASE_URL}/ingredients`,
        ingredientData,
        {
            headers: getAuthHeaders()
        }
    );

    return getNestedResponseData(response);
}

export async function updateIngredient(ingredientId, ingredientData) {
    const response = await axios.put(
        `${API_BASE_URL}/ingredients/${ingredientId}`,
        ingredientData,
        {
            headers: getAuthHeaders()
        }
    );

    return getNestedResponseData(response);
}

export async function deleteIngredient(ingredientId) {
    const response = await axios.delete(
        `${API_BASE_URL}/ingredients/${ingredientId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getNestedResponseData(response);
}