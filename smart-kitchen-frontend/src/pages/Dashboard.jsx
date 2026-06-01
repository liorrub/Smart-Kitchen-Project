import { useEffect, useState } from "react";
import { getDashboardData } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";

function Dashboard() {

    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load dashboard data when page loads
    useEffect(() => {

        loadDashboard();

    }, []);

    // Fetch all dashboard information
    async function loadDashboard() {
        try {
            const data =
                await getDashboardData();
            setDashboardData(data);
        }
        catch (error) {
            console.error(error);
            setError(
                "Failed to load dashboard"
            );
        }
        finally {

            setLoading(false);
        }
    }

    // Return ingredient name from ingredient id
    function getIngredientName(
        ingredientId
    ) {

        const ingredient =
            dashboardData?.ingredients?.find(
                ingredient =>
                    ingredient.ingredientId ===
                    ingredientId
            );

        return (
            ingredient?.name ||
            "Unknown Ingredient"
        );
    }

// Return pantry items that expire within 7 days
    function getExpiringItems() {

        if (!dashboardData?.pantry) {
            return [];
        }

        const today =
            new Date();

        return dashboardData.pantry.filter(
            item => {

                const expiryDate =
                    new Date(item.expiryDate);

                const daysUntilExpiry =
                    (
                        expiryDate - today
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    );

                return (
                    daysUntilExpiry >= 0 &&
                    daysUntilExpiry <= 7
                );
            }
        );
    }

// Return future planned meals
    function getUpcomingMeals() {

        if (!dashboardData?.mealPlan) {
            return [];
        }

        const today =
            new Date();

        return dashboardData.mealPlan
            .filter(
                meal =>
                    new Date(
                        meal.date
                    ) >= today
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );
    }

    // Loading state
    if (loading) {
        return (
            <div>
                <h1>Dashboard</h1>

                <p>
                    Loading dashboard...
                </p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div>
                <h1>Dashboard</h1>

                <p>
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>
                Smart Kitchen Dashboard
            </h1>

            <p>
                Welcome back,
                {" "}
                {user?.firstName}
                !
            </p>

            <hr />

            {/* Statistics Section */}

            <h2>
                Overview
            </h2>

            <p>
                Total Recipes:
                {" "}
                {dashboardData.recipes.length}
            </p>

            <p>
                Favorites:
                {" "}
                {dashboardData.favorites.length}
            </p>

            <p>
                Pantry Items:
                {" "}
                {dashboardData.pantry.length}
            </p>

            <p>
                Planned Meals:
                {" "}
                {dashboardData.mealPlan.length}
            </p>

            <hr />

            {/* Smart alerts section */}

            <h2>
                Smart Actions & Alerts
            </h2>

            {/* Expiring pantry items */}

            <h3>
                Expiring Soon
            </h3>

            {
                getExpiringItems().length === 0 ?

                    (
                        <p>
                            No expiring items found.
                        </p>
                    )

                    :

                    getExpiringItems().map(item => (

                        <div
                            key={item.pantryItemId}
                        >
                            <p>
                                {
                                    getIngredientName(
                                        item.ingredientId
                                    )
                                }
                            </p>

                            <p>
                                Expires:
                                {" "}
                                {
                                    item.expiryDate
                                        .split("T")[0]
                                }
                            </p>
                        </div>

                    ))
            }
            <hr />

            {/* Shopping list reminders */}

            <h3>
                Shopping Reminder
            </h3>

            {
                dashboardData.shoppingList
                    ?.filter(
                        item =>
                            !item.completed
                    )
                    .length === 0 ?

                    (
                        <p>
                            No shopping items.
                        </p>
                    )

                    :

                    dashboardData.shoppingList
                        .filter(
                            item =>
                                !item.completed
                        )
                        .map(item => (

                            <div
                                key={
                                    item.shoppingItemId
                                }
                            >
                                <p>
                                    {
                                        getIngredientName(
                                            item.ingredientId
                                        )
                                    }
                                </p>

                                <p>
                                    Quantity:
                                    {" "}
                                    {item.quantity}
                                    {" "}
                                    {item.unit}
                                </p>
                            </div>

                        ))
            }

            <hr />

            {/* Upcoming meals */}

            <h3>
                Upcoming Meals
            </h3>

            {
                getUpcomingMeals().length === 0 ?

                    (
                        <p>
                            No meals planned.
                        </p>
                    )

                    :

                    getUpcomingMeals().map(meal => (

                        <div
                            key={meal.mealId}
                        >
                            <p>
                                {meal.date}
                            </p>

                            <p>
                                {meal.mealType}
                            </p>

                            {
                                meal.notes &&
                                (
                                    <p>
                                        {meal.notes}
                                    </p>
                                )
                            }
                        </div>

                    ))
            }

            <hr />

            {/* AI History Preview */}

            <h2>
                Recent AI Activity
            </h2>

            {
                dashboardData.history
                    .slice(0, 3)
                    .map(historyItem => {

                        let displayText =
                            "AI Activity";

                        if (
                            historyItem.result?.recipeTitle
                        ) {

                            displayText =
                                historyItem.result.recipeTitle;
                        }
                        else if (
                            historyItem.result?.suggestedRecipes?.length
                        ) {

                            displayText =
                                historyItem.result
                                    .suggestedRecipes[0];
                        }
                        else if (
                            historyItem.result?.detectedDish
                        ) {

                            displayText =
                                historyItem.result
                                    .detectedDish;
                        }

                        return (
                            <div
                                key={
                                    historyItem.historyId
                                }
                            >
                                <p>
                                    {displayText}
                                </p>
                            </div>
                        );
                    })
            }

        </div>
    );
}

export default Dashboard;