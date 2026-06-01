import axios from "axios";

const BASE_URL =
    "http://localhost:3000/api";

export async function getDashboardData() {

    const storedUser =
        JSON.parse(
            localStorage.getItem("user")
        );

    const userId =
        storedUser.userId;

    const userRole =
        storedUser.userRole;

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
            `${BASE_URL}/recipes`
        ),

        axios.get(
            `${BASE_URL}/users/${userId}/favorites`,
            {
                headers: {
                    "x-user-id": userId,
                    "x-user-role": userRole
                }
            }
        ),

        axios.get(
            `${BASE_URL}/users/${userId}/pantry`,
            {
                headers: {
                    "x-user-id": userId,
                    "x-user-role": userRole
                }
            }
        ),

        axios.get(
            `${BASE_URL}/users/${userId}/meal-plan`,
            {
                headers: {
                    "x-user-id": userId,
                    "x-user-role": userRole
                }
            }
        ),

        axios.get(
            `${BASE_URL}/users/${userId}/ai/history`,
            {
                headers: {
                    "x-user-id": userId,
                    "x-user-role": userRole
                }
            }
        ),

        axios.get(
            `${BASE_URL}/ingredients`
        ),

        axios.get(
            `${BASE_URL}/users/${userId}/shopping-list`,
            {
                headers: {
                    "x-user-id": userId,
                    "x-user-role": userRole
                }
            }
        )
    ]);

    return {
        recipes:
        recipesResponse.data.data,

        favorites:
        favoritesResponse.data.data,

        pantry:
        pantryResponse.data.data,

        mealPlan:
        mealPlanResponse.data.data,

        history:
        historyResponse.data.data,

        ingredients:
        ingredientsResponse.data.data,

        shoppingList:
        shoppingListResponse.data.data
    };
}