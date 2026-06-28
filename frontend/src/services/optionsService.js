import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseDataOrBody } from "../utils/apiUtils";

export async function getOptions() {
    const response = await axios.get(`${API_BASE_URL}/options`);

    return getResponseDataOrBody(response);
}
