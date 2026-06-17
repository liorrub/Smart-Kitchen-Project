import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";

export async function getDashboardData() {

    const storedUser =
        JSON.parse(
            localStorage.getItem("user")
        );

    const userId =
        storedUser?.userId;

    const userRole =
        storedUser?.userRole;

    const headers = {
        "x-user-id": userId,
        "x-user-role": userRole
    };

    if (userRole === "admin") {

        const [
            recipesResponse,
            ingredientsResponse,
            usersResponse,
            storesResponse
        ] = await Promise.all([

            axios.get(
                `${API_BASE_URL}/recipes`
            ),

            axios.get(
                `${API_BASE_URL}/ingredients`
            ),

            axios.get(
                `${API_BASE_URL}/users`,
                { headers }
            ),

            axios.get(
                `${API_BASE_URL}/stores`
            )
        ]);

        return {
            recipes:
                recipesResponse.data.data || [],

            ingredients:
                ingredientsResponse.data.data || [],

            users:
                usersResponse.data.data || [],

            stores:
                storesResponse.data.data || [],

            favorites:
                [],

            pantry:
                [],

            mealPlan:
                [],

            history:
                [],

            shoppingList:
                []
        };
    }

    const [
        recipesResponse,
        favoritesResponse,
        pantryResponse,
        mealPlanResponse,
        historyResponse,
        ingredientsResponse,
        shoppingListResponse
    ] = await Promise.all([

        axios.get(
            `${API_BASE_URL}/recipes`
        ),

        axios.get(
            `${API_BASE_URL}/users/${userId}/favorites`,
            { headers }
        ),

        axios.get(
            `${API_BASE_URL}/users/${userId}/pantry`,
            { headers }
        ),

        axios.get(
            `${API_BASE_URL}/users/${userId}/meal-plan`,
            { headers }
        ),

        axios.get(
            `${API_BASE_URL}/users/${userId}/ai/history`,
            { headers }
        ),

        axios.get(
            `${API_BASE_URL}/ingredients`
        ),

        axios.get(
            `${API_BASE_URL}/users/${userId}/shopping-list`,
            { headers }
        )
    ]);

    return {
        recipes:
            recipesResponse.data.data || [],

        favorites:
            favoritesResponse.data.data || [],

        pantry:
            pantryResponse.data.data || [],

        mealPlan:
            mealPlanResponse.data.data || [],

        history:
            historyResponse.data.data || [],

        ingredients:
            ingredientsResponse.data.data || [],

        shoppingList:
            shoppingListResponse.data.data || [],

        users:
            [],

        reviews:
            [],

        stores:
            []
    };
}