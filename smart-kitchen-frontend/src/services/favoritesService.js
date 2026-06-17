import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";

const BASE_URL = "http://localhost:3000/api";

export async function getUserFavorites(userId) {
    const response = await axios.get(
        `${BASE_URL}/users/${userId}/favorites`,
        {
            headers: getAuthHeaders(),
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}

export async function addFavorite(userId, recipeId) {
    const response = await axios.post(
        `${BASE_URL}/users/${userId}/favorites`,
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
        `${BASE_URL}/users/${userId}/favorites/${recipeId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}
