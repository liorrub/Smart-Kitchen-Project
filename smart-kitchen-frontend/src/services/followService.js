import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

// Follow a user (POST /api/users/:id/follow)
export async function followUser(userId) {
    const response = await axios.post(
        `${API_BASE_URL}/users/${userId}/follow`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Unfollow a user (DELETE /api/users/:id/follow)
export async function unfollowUser(userId) {
    const response = await axios.delete(
        `${API_BASE_URL}/users/${userId}/follow`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Get the followers list for a user (GET /api/users/:id/followers)
export async function getFollowers(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/followers`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Get the following list for a user (GET /api/users/:id/following)
export async function getFollowing(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/following`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

// Get the authenticated user's recipe feed (GET /api/feed)
export async function getFeed() {
    const response = await axios.get(
        `${API_BASE_URL}/feed`,
        {
            headers: getAuthHeaders(),
            params: { _t: Date.now() }
        }
    );
    return getResponseData(response);
}
