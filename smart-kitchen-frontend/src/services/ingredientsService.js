import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export async function getIngredients(headers = {}) {
    const response = await axios.get(
        `${BASE_URL}/ingredients`,
        { headers }
    );

    return response.data.data;
}

export async function createIngredient(ingredientData, headers = {}) {
    const response = await axios.post(
        `${BASE_URL}/ingredients`,
        ingredientData,
        { headers }
    );

    return response.data.data;
}