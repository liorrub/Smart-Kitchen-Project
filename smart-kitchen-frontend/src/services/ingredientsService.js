import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
    const storedUser = JSON.parse(
        localStorage.getItem("user")
    );

    return {
        "x-user-id": storedUser.userId,
        "x-user-role": storedUser.userRole
    };
}

export async function getIngredients(headers = {}) {
    const response = await axios.get(
        `${BASE_URL}/ingredients`,
        { headers }
    );

    return response.data.data;
}

export async function createIngredient(ingredientData) {
    const response = await axios.post(
        `${BASE_URL}/ingredients`,
        ingredientData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
}

export async function updateIngredient(ingredientId, ingredientData) {
    const response = await axios.put(
        `${BASE_URL}/ingredients/${ingredientId}`,
        ingredientData,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
}

export async function deleteIngredient(ingredientId) {
    const response = await axios.delete(
        `${BASE_URL}/ingredients/${ingredientId}`,
        {
            headers: getAuthHeaders()
        }
    );

    return response.data.data;
}