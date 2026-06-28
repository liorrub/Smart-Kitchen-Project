import axios from "axios";

import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseData } from "../utils/apiUtils";

export async function getSuggestedCreators() {
    const response = await axios.get(`${API_BASE_URL}/feed/creators`, {
        headers: getAuthHeaders()
    });
    return getResponseData(response);
}
