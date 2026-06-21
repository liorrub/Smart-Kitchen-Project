import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

// Fetch the public profile of a user (includes stats + recent recipes).
export async function getUserProfile(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/${userId}/profile`,
        {
            headers: getAuthHeaders(),
            params: { _t: Date.now() }
        }
    );
    return getResponseData(response);
}

// Search users by name/city and optional role filter.
export async function searchUsers(query, role = "all") {
    const response = await axios.get(
        `${API_BASE_URL}/users/search`,
        {
            headers: getAuthHeaders(),
            params: { q: query, role, _t: Date.now() }
        }
    );
    return getResponseData(response);
}
