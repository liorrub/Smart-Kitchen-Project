import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";

// Like a comment. Returns { commentId, likeCount, isLikedByMe }.
export async function likeComment(commentId) {
    const response = await axios.post(
        `${API_BASE_URL}/comments/${commentId}/likes`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Unlike a comment. Returns { commentId, likeCount, isLikedByMe }.
export async function unlikeComment(commentId) {
    const response = await axios.delete(
        `${API_BASE_URL}/comments/${commentId}/likes`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}
