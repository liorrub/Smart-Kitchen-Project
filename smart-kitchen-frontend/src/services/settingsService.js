import axios from "axios";

const BASE_URL =
    "http://localhost:3000/api/settings";

export async function getSettings() {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.get(
        BASE_URL,
        {
            headers: {
                "x-user-id":
                storedUser.userId
            }
        }
    );

    return response.data;
}

export async function updateSettings(
    settingsData
) {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.put(
        BASE_URL,
        settingsData,
        {
            headers: {
                "x-user-id":
                storedUser.userId
            }
        }
    );

    return response.data;
}