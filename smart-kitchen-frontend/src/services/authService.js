import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export async function login(email, password) {
    const response = await axios.post(
        `${BASE_URL}/auth/login`,
        {
            email,
            password
        }
    );

    return response.data;
}

export async function getCurrentUser(userId) {
    const response = await axios.get(
        `${BASE_URL}/auth/me`,
        {
            headers: {
                "x-user-id": userId
            }
        }
    );

    return response.data;
}

export async function logout() {
    const response = await axios.post(
        `${BASE_URL}/auth/logout`
    );

    return response.data;
}