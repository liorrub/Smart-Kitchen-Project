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

// Toggle the current user's helpful vote on a review.
export async function toggleReviewHelpfulVote(recipeId, reviewId) {
    const response = await axios.post(
        `${API_BASE_URL}/recipes/${recipeId}/reviews/${reviewId}/helpful`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Report a review with a reason and optional details.
export async function reportReview(recipeId, reviewId, data) {
    const response = await axios.post(
        `${API_BASE_URL}/recipes/${recipeId}/reviews/${reviewId}/report`,
        data,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Admin: get all review reports (optional ?status= filter).
export async function getReviewReports(status) {
    const response = await axios.get(
        `${API_BASE_URL}/review-reports`,
        {
            params: status ? { status } : {},
            headers: getAuthHeaders()
        }
    );
    return getResponseData(response);
}

// Admin: update a review report's status.
export async function updateReviewReport(reportId, data) {
    const response = await axios.put(
        `${API_BASE_URL}/review-reports/${reportId}`,
        data,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Admin: get count of open review reports — for the navbar indicator.
export async function getOpenReviewReportCount() {
    const response = await axios.get(
        `${API_BASE_URL}/review-reports/count`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Admin: delete a review through the moderation workflow.
export async function deleteReviewThroughModeration(reportId) {
    const response = await axios.delete(
        `${API_BASE_URL}/review-reports/${reportId}/delete-review`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}
