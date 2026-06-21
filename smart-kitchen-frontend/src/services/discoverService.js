import axios from "axios";

import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

export async function getDiscoverCreators() {
    const response = await axios.get(`${API_BASE_URL}/discover`, {
        headers: getAuthHeaders()
    });
    return response.data;
}
