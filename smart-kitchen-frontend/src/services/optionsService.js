import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export async function getOptions() {
    const response = await axios.get(`${BASE_URL}/options`);

    return response.data?.data || response.data;
}
