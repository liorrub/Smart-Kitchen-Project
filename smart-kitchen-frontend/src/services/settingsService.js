import axios from "axios";

const BASE_URL =
    "http://localhost:3000/api/settings";

export async function getSettings() {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.get(
        BASE_URL,
        {
            headers: {
                "x-user-id":
                storedUser.userId
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
        BASE_URL,
        settingsData,
        {
            headers: {
                "x-user-id":
                storedUser.userId
            }
        }
    );

    return response.data;
}

export async function changePassword(userId, passwordData) {
    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const url = `http://localhost:3000/api/users/${userId}/change-password`;
    const headers = {
        "x-user-id": userId,
        "x-user-role": storedUser?.userRole || "user"
    };

    console.log("[changePassword] Request details:");
    console.log("URL:", url);
    console.log("Headers:", headers);
    console.log("Body:", { currentPassword: "***", newPassword: "***" });

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