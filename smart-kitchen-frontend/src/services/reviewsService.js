import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";

const BASE_URL = "http://localhost:3000/api";

export async function getRecipeReviews(recipeId) {
    const response = await axios.get(
        `${BASE_URL}/recipes/${recipeId}/reviews`,
        {
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}

export async function createRecipeReview(recipeId, reviewData) {
    const response = await axios.post(
        `${BASE_URL}/recipes/${recipeId}/reviews`,
        reviewData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function updateRecipeReview(recipeId, reviewId, reviewData) {
    const response = await axios.put(
        `${BASE_URL}/recipes/${recipeId}/reviews/${reviewId}`,
        reviewData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function deleteRecipeReview(recipeId, reviewId) {
    const response = await axios.delete(
        `${BASE_URL}/recipes/${recipeId}/reviews/${reviewId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}
