import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getStoredUser, getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

export async function getAIHistory() {
    const storedUser = getStoredUser();

    if (!storedUser?.userId) {
        return [];
    }

    const response = await axios.get(
        `${API_BASE_URL}/users/${storedUser.userId}/ai/history`,
        {
            headers: getAuthHeaders(),
            params: {
                _t: Date.now()
            }
        }
    );

    return getResponseData(response);
}
