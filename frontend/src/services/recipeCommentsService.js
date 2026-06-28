// Recipe comments REST service
// Handles loading comment history and deleting comments.
// Comment creation is done via Socket.IO, not REST.

import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";

// Fetch all comments for a recipe, ordered oldest-first.
export async function getComments(recipeId) {
    const response = await axios.get(
        `${API_BASE_URL}/recipes/${recipeId}/comments`
    );
    return getResponseData(response);
}

// Update the content of a comment. Caller must be the comment owner or an admin.
export async function updateComment(recipeId, commentId, content) {
    const response = await axios.put(
        `${API_BASE_URL}/recipes/${recipeId}/comments/${commentId}`,
        { content },
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Delete a comment by ID. Caller must be the comment owner or an admin.
export async function deleteComment(recipeId, commentId) {
    const response = await axios.delete(
        `${API_BASE_URL}/recipes/${recipeId}/comments/${commentId}`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}
