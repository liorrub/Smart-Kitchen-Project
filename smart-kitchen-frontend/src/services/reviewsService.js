import axios from "axios";

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

function getResponseData(response) {
    return response.data?.data || response.data || [];
}

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
