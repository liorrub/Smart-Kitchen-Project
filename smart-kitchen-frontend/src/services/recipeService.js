import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getResponseData, getResponseDataOrBody } from "../utils/apiUtils";

const RECIPES_API_URL = `${API_BASE_URL}/recipes`;

// Fetch all recipes from the catalog.
export async function getAllRecipes() {
    const response = await axios.get(RECIPES_API_URL);

    return getResponseData(response);
}

// Fetch a single recipe by its ID.
export async function getRecipeById(recipeId) {
    const response = await axios.get(`${RECIPES_API_URL}/${recipeId}`);

    return getResponseDataOrBody(response);
}

// Create a new recipe using the logged-in user's credentials.
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

// Update an existing recipe using the logged-in user's credentials.
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

// Delete a recipe using the logged-in user's credentials.
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