import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";

export async function getOptions() {
    const response = await axios.get(`${API_BASE_URL}/options`);

    return response.data?.data || response.data;
}
