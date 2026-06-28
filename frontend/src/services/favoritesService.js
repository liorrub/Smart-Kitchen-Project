import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

// Fetch the user's saved favorite recipes. Cache-busting param prevents stale results.
export async function getUserFavorites(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/favorites`,
        {
            headers: getAuthHeaders(),
            // Cache-busting timestamp so browsers never serve a stale favorites list.
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}

// Add a recipe to the user's favorites list.
export async function addFavorite(userId, recipeId) {
    const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/favorites`,
        {
            recipeId
        },
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

// Remove a recipe from the user's favorites list.
export async function removeFavorite(userId, recipeId) {
    const response = await axios.delete(
        `${API_BASE_URL}/users/${userId}/favorites/${recipeId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}
