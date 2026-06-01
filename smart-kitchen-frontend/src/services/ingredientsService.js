import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

export async function getIngredients() {

    const response = await axios.get(
        `${BASE_URL}/ingredients`
    );

    return response.data.data;
}