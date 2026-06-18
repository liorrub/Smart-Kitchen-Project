import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

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

export async function removeFavorite(userId, recipeId) {
    const response = await axios.delete(
        `${API_BASE_URL}/users/${userId}/favorites/${recipeId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}
