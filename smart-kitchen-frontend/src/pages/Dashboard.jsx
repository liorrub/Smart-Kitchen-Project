import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import { getRecipeReviews } from "../services/reviewsService";

function Dashboard() {

    const { user } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [chefStats, setChefStats] = useState({
        myRecipesCount: 0,
        averageRating: 0,
        totalReviews: 0
    });

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

            if (user?.userRole === "chef") {
                await loadChefStats(data);
            }
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

    // Calculate statistics for the logged-in chef
    async function loadChefStats(data) {
        try {
            const chefRecipes =
                data.recipes.filter(recipe =>
                        String(recipe.creatorId) === String(user?.userId));

            const reviewsByRecipe =
                await Promise.all(
                    chefRecipes.map(
                        recipe =>
                            getRecipeReviews(recipe.recipeId)
                    )
                );

            const allReviews = reviewsByRecipe.flat();

            const totalReviews = allReviews.length;

            const ratingSum = allReviews.reduce(
                    (sum, review) =>
                        sum + Number(review.rating), 0);

            const averageRating = totalReviews === 0 ? 0 : ratingSum / totalReviews;

            setChefStats({
                myRecipesCount: chefRecipes.length,
                averageRating: averageRating,
                totalReviews: totalReviews
            });
        }
        catch (error) {
            console.error(error);

            setChefStats({
                myRecipesCount: 0,
                averageRating: 0,
                totalReviews: 0
            });
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

            {
                user?.userRole === "admin" ?

                    (
                        <>
                            <p>
                                Total Users:
                                {" "}
                                {dashboardData.users.length}
                            </p>

                            <p>
                                Total Recipes:
                                {" "}
                                {dashboardData.recipes.length}
                            </p>

                            <p>
                                Total Ingredients:
                                {" "}
                                {dashboardData.ingredients.length}
                            </p>

                            <p>
                                Total Stores:
                                {" "}
                                {dashboardData.stores.length}
                            </p>

                            <hr />

                            <h2>
                                Management Center
                            </h2>

                            <p>
                                Manage the main system data from one place.
                            </p>

                            <div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/users")}
                                >
                                    Manage Users
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/ingredients")}
                                >
                                    Manage Ingredients
                                </button>

                                <button
                                    type="button"
                                    onClick={() => navigate("/recipe-management")}
                                >
                                    Manage Recipes
                                </button>
                            </div>
                        </>
                    )

                    :

                    (
                        <>
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

                            <p>
                                Shopping List Items:
                                {" "}
                                {dashboardData.shoppingList.length}
                            </p>

                            {
                                user?.userRole === "chef" &&
                                (
                                    <>
                                        <hr />

                                        <h2>
                                            Chef Tools
                                        </h2>

                                        <p>
                                            Manage your recipes and track their performance.
                                        </p>

                                        <div>
                                            <p>
                                                My Recipes:
                                                {" "}
                                                {chefStats.myRecipesCount}
                                            </p>

                                            <p>
                                                Average Rating:
                                                {" "}
                                                {
                                                    chefStats.totalReviews === 0
                                                        ? "No ratings yet"
                                                        : chefStats.averageRating.toFixed(1)
                                                }
                                                {" "}
                                                ⭐
                                            </p>

                                            <p>
                                                Total Reviews:
                                                {" "}
                                                {chefStats.totalReviews}
                                            </p>
                                        </div>

                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => navigate("/chef/my-recipes")}
                                            >
                                                Manage My Recipes
                                            </button>
                                        </div>
                                    </>
                                )
                            }
                        </>
                    )
            }

            <hr />

            {
                user?.userRole !== "admin" &&
                (
                    <>
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
                                            key={item.shoppingItemId}
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
                                        historyItem.result
                                            ?.suggestedRecipes
                                            ?.length
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
                    </>
                )
            }
            </div>
        );
    }

    export default Dashboard;