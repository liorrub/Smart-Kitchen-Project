import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

// Fetch the list of recipe IDs the current user has liked.
export async function getUserLikedRecipeIds(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/likes`,
        {
            headers: getAuthHeaders(),
            params: { _t: Date.now() }
        }
    );
    return getResponseData(response);
}

// Like a recipe.
export async function likeRecipe(recipeId) {
    const response = await axios.post(
        `${API_BASE_URL}/recipes/${recipeId}/like`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Unlike a recipe.
export async function unlikeRecipe(recipeId) {
    const response = await axios.delete(
        `${API_BASE_URL}/recipes/${recipeId}/like`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}
