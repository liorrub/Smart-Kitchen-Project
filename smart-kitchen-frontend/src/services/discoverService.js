import axios from "axios";

import { getAuthHeaders } from "../utils/authUtils";

export async function getDiscoverCreators() {
    const response = await axios.get("/api/discover", {
        headers: getAuthHeaders()
    });
    return response.data;
}
