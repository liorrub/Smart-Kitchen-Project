import axios from "axios";

import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseDataOrBody } from "../utils/apiUtils";

// Fetch all registered users (admin only).
export async function getUsers() {
    const response = await axios.get(
        `${API_BASE_URL}/users`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseDataOrBody(response);
}

// Create a new user account (admin only).
export async function createUser(userData) {
    const response = await axios.post(
        `${API_BASE_URL}/users`,
        userData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseDataOrBody(response);
}

// Update an existing user's profile details.
export async function updateUser(userId, userData) {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/users/${userId}`,
            userData,
            {
                headers: getAuthHeaders()
            }
        );

        return getResponseDataOrBody(response);
    } catch (error) {
        console.error(
            "Update user failed:",
            error.response?.data || error
        );

        throw error;
    }
}

// Delete a user account (admin only).
export async function deleteUser(userId) {
    const response = await axios.delete(
        `${API_BASE_URL}/users/${userId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseDataOrBody(response);
}