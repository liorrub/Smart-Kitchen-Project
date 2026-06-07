import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
    const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole || storedUser?.role
    };
}

function getResponseData(response) {
    return response.data?.data || response.data;
}

export async function getUsers() {
    const response = await axios.get(
        `${BASE_URL}/users`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function createUser(userData) {
    const response = await axios.post(
        `${BASE_URL}/users`,
        userData,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}

export async function updateUser(userId, userData) {
    try {
        const response = await axios.put(
            `${BASE_URL}/users/${userId}`,
            userData,
            {
                headers: getAuthHeaders()
            }
        );

        return getResponseData(response);
    } catch (error) {
        console.error(
            "Update user failed:",
            error.response?.data || error
        );

        throw error;
    }
}

export async function deleteUser(userId) {
    const response = await axios.delete(
        `${BASE_URL}/users/${userId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return getResponseData(response);
}