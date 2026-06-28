import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";

// Returns response.data (the full body: { success, data, error }).
// Callers access the user object via result.data, not result.data.data.
export async function login(email, password) {
    const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
            email,
            password
        }
    );

    return response.data;
}

// Fetch the current user's full profile. Used after login so DevTools shows GET /api/users/me.
export async function getCurrentUser(userId) {
    const response = await axios.get(
        `${API_BASE_URL}/users/me`,
        {
            headers: {
                "x-user-id": userId
            }
        }
    );

    return response.data;
}

// Create a new user account and return the full response body.
export async function register(userData) {
    const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            city: userData.city,
            age: userData.age,
            cookingLevel: userData.cookingLevel,
            username: userData.username,
            avatarKey: userData.avatarKey
        }
    );

    return response.data;
}

// End the current session on the server side.
export async function logout() {
    const response = await axios.post(
        `${API_BASE_URL}/auth/logout`
    );

    return response.data;
}