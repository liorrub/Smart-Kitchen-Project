import axios from "axios";

import { getResponseData } from "../utils/apiUtils";

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

export async function getAIHistory() {
    const storedUser = getStoredUser();

    if (!storedUser?.userId) {
        return [];
    }

    const response = await axios.get(
        `${BASE_URL}/users/${storedUser.userId}/ai/history`,
        {
            headers: getAuthHeaders(),
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}
