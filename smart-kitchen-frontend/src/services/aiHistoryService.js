import axios from "axios";

import { getResponseData } from "../utils/apiUtils";
import { getStoredUser, getAuthHeaders } from "../utils/authUtils";

const BASE_URL = "http://localhost:3000/api";

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
