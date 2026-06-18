import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getNestedResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";

// Fetch all ingredients from the system catalog.
export async function getIngredients(headers = {}) {
    const response = await axios.get(
        `${API_BASE_URL}/ingredients`,
        { headers }
    );

    return getNestedResponseData(response);
}

// Create a new ingredient in the system catalog (admin only).
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

// Update an existing ingredient's name, category or allergen flag.
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

// Delete an ingredient from the system catalog.
export async function deleteIngredient(ingredientId) {
    const response = await axios.delete(
        `${API_BASE_URL}/ingredients/${ingredientId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getNestedResponseData(response);
}