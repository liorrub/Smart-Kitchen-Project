import axios from "axios";

const BASE_URL = "http://localhost:3000/api";
const RECIPES_API_URL = `${BASE_URL}/recipes`;

export async function getAllRecipes() {
    const response = await axios.get(RECIPES_API_URL);

    return response.data?.data || response.data || [];
}

export async function getRecipeById(recipeId) {
    const response = await axios.get(`${RECIPES_API_URL}/${recipeId}`);

    return response.data?.data || response.data;
}

export async function createRecipe(recipeData, user) {
    const response = await axios.post(
        RECIPES_API_URL,
        recipeData,
        {
            headers: {
                "x-user-id": user.userId,
                "x-user-role": user.userRole
            }
        }
    );

    return response.data?.data || response.data;
}

export async function updateRecipe(recipeId, recipeData, user) {
    const response = await axios.put(
        `${RECIPES_API_URL}/${recipeId}`,
        recipeData,
        {
            headers: {
                "x-user-id": user.userId,
                "x-user-role": user.userRole
            }
        }
    );

    return response.data?.data || response.data;
}

export async function deleteRecipe(recipeId, user) {
    const response = await axios.delete(
        `${RECIPES_API_URL}/${recipeId}`,
        {
            headers: {
                "x-user-id": user.userId,
                "x-user-role": user.userRole
            }
        }
    );

    return response.data?.data || response.data;
}