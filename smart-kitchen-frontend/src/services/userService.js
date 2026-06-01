import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export async function getUsers() {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.get(
        `${BASE_URL}/users`,
        {
            headers: {
                "x-user-id": storedUser.userId,
                "x-user-role": storedUser.userRole
            }
        }
    );

    return response.data.data;
}

export async function updateUser(userId, userData) {

    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    const response = await axios.put(
        `${BASE_URL}/users/${userId}`,
        userData,
        {
            headers: {
                "x-user-id": storedUser.userId,
                "x-user-role": storedUser.userRole
            }
        }
    );

    return response.data;
}