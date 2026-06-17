import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";

const SETTINGS_API_URL = `${API_BASE_URL}/settings`;

export async function getSettings() {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.get(
        SETTINGS_API_URL,
        {
            headers: {
                "x-user-id":
                storedUser?.userId
            }
        }
    );

    return response.data;
}

export async function updateSettings(
    settingsData
) {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.put(
        SETTINGS_API_URL,
        settingsData,
        {
            headers: {
                "x-user-id":
                storedUser?.userId
            }
        }
    );

    return response.data;
}

export async function changePassword(userId, passwordData) {
    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const url = `${API_BASE_URL}/users/${userId}/change-password`;
    const headers = {
        "x-user-id": userId,
        "x-user-role": storedUser?.userRole || "user"
    };

    try {
        const response = await axios.put(
            url,
            passwordData,
            { headers }
        );
        return response.data;
    } catch (error) {
        console.error("[changePassword] Error response:", error.response?.data || error.message);
        throw error;
    }
}