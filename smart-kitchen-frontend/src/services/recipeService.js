import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseData, getResponseDataOrBody } from "../utils/apiUtils";

const RECIPES_API_URL = `${API_BASE_URL}/recipes`;

export async function getAllRecipes() {
    const response = await axios.get(RECIPES_API_URL);

    return getResponseData(response);
}

export async function getRecipeById(recipeId) {
    const response = await axios.get(`${RECIPES_API_URL}/${recipeId}`);

    return getResponseDataOrBody(response);
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

    return getResponseDataOrBody(response);
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

    return getResponseDataOrBody(response);
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

    return getResponseDataOrBody(response);
}