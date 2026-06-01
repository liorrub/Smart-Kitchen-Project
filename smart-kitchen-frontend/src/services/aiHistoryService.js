import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export async function getAIHistory() {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.get(
        `${BASE_URL}/ai/history`,
        {
            headers: {
                "x-user-id": storedUser.userId,
                "x-user-role": storedUser.userRole
            }
        }
    );

    return response.data.data;
}