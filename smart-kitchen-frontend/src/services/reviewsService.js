import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

// Fetch all reviews for a specific recipe. Cache-busting param prevents stale results.
export async function getRecipeReviews(recipeId) {
    const response = await axios.get(
        `${API_BASE_URL}/recipes/${recipeId}/reviews`,
        {
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}

// Submit a new review for a recipe.
export async function createRecipeReview(recipeId, reviewData) {
    const response = await axios.post(
        `${API_BASE_URL}/recipes/${recipeId}/reviews`,
        reviewData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

// Update an existing review for a recipe.
export async function updateRecipeReview(recipeId, reviewId, reviewData) {
    const response = await axios.put(
        `${API_BASE_URL}/recipes/${recipeId}/reviews/${reviewId}`,
        reviewData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

// Delete a review from a recipe.
export async function deleteRecipeReview(recipeId, reviewId) {
    const response = await axios.delete(
        `${API_BASE_URL}/recipes/${recipeId}/reviews/${reviewId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}
