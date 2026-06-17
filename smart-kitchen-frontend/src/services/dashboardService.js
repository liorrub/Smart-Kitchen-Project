import axios from "axios";

import { API_BASE_URL } from "../utils/apiConfig";
import { getNestedResponseDataOrEmptyArray } from "../utils/apiUtils";

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
                getNestedResponseDataOrEmptyArray(recipesResponse),

            ingredients:
                getNestedResponseDataOrEmptyArray(ingredientsResponse),

            users:
                getNestedResponseDataOrEmptyArray(usersResponse),

            stores:
                getNestedResponseDataOrEmptyArray(storesResponse),

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
            getNestedResponseDataOrEmptyArray(recipesResponse),

        favorites:
            getNestedResponseDataOrEmptyArray(favoritesResponse),

        pantry:
            getNestedResponseDataOrEmptyArray(pantryResponse),

        mealPlan:
            getNestedResponseDataOrEmptyArray(mealPlanResponse),

        history:
            getNestedResponseDataOrEmptyArray(historyResponse),

        ingredients:
            getNestedResponseDataOrEmptyArray(ingredientsResponse),

        shoppingList:
            getNestedResponseDataOrEmptyArray(shoppingListResponse),

        users:
            [],

        reviews:
            [],

        stores:
            []
    };
}