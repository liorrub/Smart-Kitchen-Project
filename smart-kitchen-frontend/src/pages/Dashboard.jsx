import "./Dashboard.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import PageHero from "../components/PageHero";
import RecipeDetailsModal from "../components/RecipeDetailsModal";
import MessageModal from "../components/MessageModal";

import { getDashboardData } from "../services/dashboardService";
import { useAuth } from "../context/AuthContext";
import { getRecipeReviews } from "../services/reviewsService";
import {
    getChefRequests,
    approveChefRequest,
    rejectChefRequest
} from "../services/chefRequestService";

const USERS_API_URL = "http://localhost:3000/api/users";

const ROUTES = {
    users: "/users",
    ingredients: "/ingredients",
    recipeManagement: "/recipe-management",
    stores: "/stores",
    chefRecipes: "/chef/my-recipes",
    chefCreateRecipe: "/chef/my-recipes",
    shoppingList: "/shopping-list"
};

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

    const [pendingChefRequests, setPendingChefRequests] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [dashboardMessage, setDashboardMessage] = useState("");
    const [dashboardActionError, setDashboardActionError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState("");

    const role = String(user?.userRole || user?.role || "user").toLowerCase();
    const isAdmin = role === "admin";
    const isChef = role === "chef";

    const users = dashboardData?.users || [];
    const recipes = dashboardData?.recipes || [];
    const ingredients = dashboardData?.ingredients || [];
    const stores = dashboardData?.stores || [];
    const favorites = dashboardData?.favorites || [];
    const pantry = dashboardData?.pantry || [];
    const mealPlan = dashboardData?.mealPlan || [];
    const shoppingList = dashboardData?.shoppingList || [];

    useEffect(() => {
        loadDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, user?.userRole]);

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");
            setDashboardMessage("");
            setDashboardActionError("");

            const data = await getDashboardData();

            setDashboardData(data);

            if (String(user?.userRole || user?.role).toLowerCase() === "admin") {
                const requests = await getChefRequests();
                setPendingChefRequests(requests);
            }

            if (String(user?.userRole || user?.role).toLowerCase() === "chef") {
                await loadChefStats(data);
            }
        } catch (error) {
            console.error(error);
            setError("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }

    async function loadChefStats(data) {
        try {
            const chefRecipes = (data?.recipes || []).filter(
                (recipe) => String(recipe.creatorId) === String(user?.userId)
            );

            const reviewsByRecipe = await Promise.all(
                chefRecipes.map((recipe) => getRecipeReviews(recipe.recipeId))
            );

            const allReviews = reviewsByRecipe.flat();
            const totalReviews = allReviews.length;

            const ratingSum = allReviews.reduce(
                (sum, review) => sum + Number(review.rating || 0),
                0
            );

            const averageRating =
                totalReviews === 0 ? 0 : ratingSum / totalReviews;

            setChefStats({
                myRecipesCount: chefRecipes.length,
                averageRating,
                totalReviews
            });
        } catch (error) {
            console.error(error);

            setChefStats({
                myRecipesCount: 0,
                averageRating: 0,
                totalReviews: 0
            });
        }
    }

    function getAuthHeaders() {
        return {
            "x-user-id": user?.userId,
            "x-user-role": user?.userRole || user?.role
        };
    }

    function getResponseData(response) {
        return response.data?.data || response.data;
    }

    function getItemId(item, firstKey, secondKey) {
        return item?.[firstKey] || item?.[secondKey];
    }

    function getIngredientName(ingredientId) {
        const ingredient = ingredients.find(
            (ingredient) =>
                String(ingredient.ingredientId || ingredient.id) ===
                String(ingredientId)
        );

        return ingredient?.name || `Ingredient #${ingredientId}`;
    }

    function getRecipeById(recipeId) {
        return recipes.find(
            (recipe) =>
                String(recipe.recipeId || recipe.id) === String(recipeId)
        );
    }

    function getRecipeTitle(recipeId) {
        const recipe = getRecipeById(recipeId);

        return recipe?.title || recipe?.name || "Planned meal";
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "No date";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue).split("T")[0];
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getDaysUntilDate(dateValue) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(dateValue);
        targetDate.setHours(0, 0, 0, 0);

        return Math.ceil(
            (targetDate.getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        );
    }

    function getExpiringItems() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return pantry
            .filter((item) => {
                if (!item.expiryDate) {
                    return false;
                }

                const daysUntilExpiry = getDaysUntilDate(item.expiryDate);

                return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
            })
            .sort(
                (a, b) =>
                    new Date(a.expiryDate).getTime() -
                    new Date(b.expiryDate).getTime()
            );
    }

    function getUpcomingMeals() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return mealPlan
            .filter((meal) => {
                if (!meal.date) {
                    return false;
                }

                const mealDate = new Date(meal.date);
                mealDate.setHours(0, 0, 0, 0);

                return mealDate >= today;
            })
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 4);
    }

    function getOpenShoppingItems() {
        return shoppingList.filter(
            (item) => !item.completed && !item.isCompleted
        );
    }

    async function handleApproveRequest(requestId) {
        try {
            setActionLoadingId(`approve-${requestId}`);
            clearDashboardMessages();
            await approveChefRequest(requestId);
            setPendingChefRequests((prev) =>
                prev.filter((r) => r.requestId !== requestId)
            );
            setDashboardMessage("Chef request approved successfully.");
        } catch (err) {
            console.error(err);
            setDashboardActionError("Failed to approve chef request.");
        } finally {
            setActionLoadingId("");
        }
    }

    async function handleRejectRequest(requestId) {
        try {
            setActionLoadingId(`reject-${requestId}`);
            clearDashboardMessages();
            await rejectChefRequest(requestId);
            setPendingChefRequests((prev) =>
                prev.filter((r) => r.requestId !== requestId)
            );
            setDashboardMessage("Chef request rejected.");
        } catch (err) {
            console.error(err);
            setDashboardActionError("Failed to reject chef request.");
        } finally {
            setActionLoadingId("");
        }
    }

    function getUserDisplayName(person) {
        return (
            [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
            person?.username ||
            person?.email ||
            "Unknown user"
        );
    }

    function getRoleLabel() {
        if (isAdmin) {
            return "Admin";
        }

        if (isChef) {
            return "Chef";
        }

        return "User";
    }

    function clearDashboardMessages() {
        setDashboardMessage("");
        setDashboardActionError("");
    }

    function openRecipeFromMeal(meal) {
        clearDashboardMessages();

        const recipe = getRecipeById(meal.itemId);

        if (!recipe) {
            setDashboardActionError("Recipe details were not found.");
            return;
        }

        setSelectedRecipe(recipe);
    }

    async function addExpiringItemToShoppingList(item) {
        const pantryItemId = getItemId(item, "pantryItemId", "id");

        try {
            setActionLoadingId(`add-shopping-${pantryItemId}`);
            clearDashboardMessages();

            const alreadyInShoppingList = shoppingList.some(
                (shoppingItem) =>
                    String(shoppingItem.ingredientId) ===
                    String(item.ingredientId) &&
                    !shoppingItem.completed &&
                    !shoppingItem.isCompleted
            );

            if (alreadyInShoppingList) {
                setDashboardMessage(
                    `${getIngredientName(
                        item.ingredientId
                    )} is already in your shopping list.`
                );
                return;
            }

            const response = await axios.post(
                `${USERS_API_URL}/${user.userId}/shopping-list`,
                {
                    ingredientId: Number(item.ingredientId),
                    quantity: Number(item.quantity) || 1,
                    unit: item.unit || "piece"
                },
                {
                    headers: getAuthHeaders()
                }
            );

            const newShoppingItem = getResponseData(response);

            setDashboardData((previousData) => ({
                ...previousData,
                shoppingList: [
                    ...(previousData?.shoppingList || []),
                    newShoppingItem
                ]
            }));

            setDashboardMessage(
                `${getIngredientName(
                    item.ingredientId
                )} was added to your shopping list.`
            );
        } catch (error) {
            console.error(error);
            setDashboardActionError("Failed to add item to shopping list.");
        } finally {
            setActionLoadingId("");
        }
    }

    async function removePantryItemFromDashboard(item) {
        const pantryItemId = getItemId(item, "pantryItemId", "id");

        try {
            setActionLoadingId(`remove-pantry-${pantryItemId}`);
            clearDashboardMessages();

            await axios.delete(
                `${USERS_API_URL}/${user.userId}/pantry/${pantryItemId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            setDashboardData((previousData) => ({
                ...previousData,
                pantry: (previousData?.pantry || []).filter(
                    (pantryItem) =>
                        String(
                            getItemId(pantryItem, "pantryItemId", "id")
                        ) !== String(pantryItemId)
                )
            }));

            setDashboardMessage(
                `${getIngredientName(item.ingredientId)} was removed.`
            );
        } catch (error) {
            console.error(error);
            setDashboardActionError("Failed to remove pantry item.");
        } finally {
            setActionLoadingId("");
        }
    }

    async function markShoppingItemAsBought(item) {
        const shoppingItemId = getItemId(item, "shoppingItemId", "id");

        try {
            setActionLoadingId(`bought-${shoppingItemId}`);
            clearDashboardMessages();

            const response = await axios.put(
                `${USERS_API_URL}/${user.userId}/shopping-list/${shoppingItemId}`,
                {
                    completed: true
                },
                {
                    headers: getAuthHeaders()
                }
            );

            const updatedItem = getResponseData(response);

            setDashboardData((previousData) => ({
                ...previousData,
                shoppingList: (previousData?.shoppingList || []).map(
                    (shoppingItem) =>
                        String(
                            getItemId(shoppingItem, "shoppingItemId", "id")
                        ) === String(shoppingItemId)
                            ? updatedItem
                            : shoppingItem
                )
            }));

            setDashboardMessage(
                `${getIngredientName(item.ingredientId)} was marked as bought.`
            );
        } catch (error) {
            console.error(error);
            setDashboardActionError("Failed to update shopping item.");
        } finally {
            setActionLoadingId("");
        }
    }

    const expiringItems = getExpiringItems();
    const upcomingMeals = getUpcomingMeals();
    const openShoppingItems = getOpenShoppingItems();
    const activeDashboardMessage = dashboardMessage || dashboardActionError;

    const adminStats = [
        {
            label: "Users",
            value: users.length,
            icon: "👥",
            description: "Registered accounts"
        },
        {
            label: "Recipes",
            value: recipes.length,
            icon: "📖",
            description: "Recipes in the system"
        },
        {
            label: "Ingredients",
            value: ingredients.length,
            icon: "🥕",
            description: "Ingredient catalog"
        },
        {
            label: "Stores",
            value: stores.length,
            icon: "🏪",
            description: "Available stores"
        },
        {
            label: "Chef Requests",
            value: pendingChefRequests.length,
            icon: "🧑‍🍳",
            description: "Pending role requests"
        }
    ];

    const userStats = [
        {
            label: "Recipes",
            value: recipes.length,
            icon: "📖",
            description: "Available recipes"
        },
        {
            label: "Favorites",
            value: favorites.length,
            icon: "❤️",
            description: "Saved favorites"
        },
        {
            label: "Pantry Items",
            value: pantry.length,
            icon: "🥫",
            description: "Items in your pantry"
        },
        {
            label: "Planned Meals",
            value: mealPlan.length,
            icon: "📅",
            description: "Meals in your plan"
        },
        {
            label: "Shopping Items",
            value: shoppingList.length,
            icon: "🛒",
            description: "Items on your list"
        }
    ];

    if (loading) {
        return (
            <main className="dashboard-page">

                <div className="dashboard-state-card">
                    <div className="dashboard-loader" />
                    <h1>Loading dashboard...</h1>
                    <p>Preparing your kitchen overview.</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="dashboard-page">
                <div className="dashboard-state-card dashboard-error">
                    <span>⚠️</span>
                    <h1>Dashboard error</h1>
                    <p>{error}</p>

                    <button
                        type="button"
                        className="dashboard-primary-button"
                        onClick={loadDashboard}
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-page">
            <MessageModal
                type={dashboardMessage ? "success" : "error"}
                title={dashboardMessage ? "Success" : "Dashboard Error"}
                message={activeDashboardMessage}
                buttonText="Got It 👍"
                onClose={() => {
                    setDashboardMessage("");
                    setDashboardActionError("");
                }}
            />

            <PageHero
                label="Smart Kitchen Dashboard"
                title={`Welcome back, ${user?.firstName || "Food Lover"} 👋`}
                description="Your kitchen overview, alerts and management tools in one place."
            >
                <div className={`dashboard-role-card ${role}`}>
                    <span>{isAdmin ? "🛠️" : isChef ? "🧑‍🍳" : "🍽️"}</span>
                    <p>Logged in as</p>
                    <strong>{getRoleLabel()}</strong>
                </div>
            </PageHero>

            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <div>
                        <p className="dashboard-section-kicker">Overview</p>
                        <h2>{isAdmin ? "System Snapshot" : "My Kitchen Snapshot"}</h2>
                    </div>
                </div>

                <div className="dashboard-stats-grid">
                    {(isAdmin ? adminStats : userStats).map((stat) => (
                        <article className="dashboard-stat-card" key={stat.label}>
                            <div className="dashboard-stat-icon">{stat.icon}</div>

                            <div>
                                <span>{stat.label}</span>
                                <strong>{stat.value}</strong>
                                <p>{stat.description}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {isAdmin && (
                <>
                    <section className="dashboard-section">
                        <div className="dashboard-section-header">
                            <div>
                                <p className="dashboard-section-kicker">Admin Area</p>
                                <h2>Management Center</h2>
                            </div>

                            <p>
                                Manage users, ingredients and recipes from one control panel.
                            </p>
                        </div>

                        <div className="dashboard-management-grid">
                            <ManagementCard
                                icon="👥"
                                title="Users"
                                description="Add users, remove users and manage roles."
                                buttonLabel="Manage Users"
                                onClick={() => navigate(ROUTES.users)}
                            />

                            <ManagementCard
                                icon="🥕"
                                title="Ingredients"
                                description="Create, update and delete ingredients."
                                buttonLabel="Manage Ingredients"
                                onClick={() => navigate(ROUTES.ingredients)}
                            />

                            <ManagementCard
                                icon="📖"
                                title="Recipes"
                                description="Review, edit or remove recipes."
                                buttonLabel="Manage Recipes"
                                onClick={() => navigate(ROUTES.recipeManagement)}
                            />
                        </div>
                    </section>

                    <section className="dashboard-section dashboard-two-columns">
                        <article className="dashboard-panel">
                            <div className="dashboard-panel-header">
                                <span>🧑‍🍳</span>
                                <div>
                                    <h3>Pending Chef Requests</h3>
                                    <p>Users who may want chef permissions.</p>
                                </div>
                            </div>

                            {pendingChefRequests.length === 0 ? (
                                <EmptyState text="No pending chef requests right now." />
                            ) : (
                                <div className="dashboard-mini-list">
                                    {pendingChefRequests.slice(0, 4).map((request) => {
                                        const requester = users.find(
                                            (u) => String(u.userId) === String(request.userId)
                                        );
                                        return (
                                            <div
                                                className="dashboard-mini-item"
                                                key={request.requestId}
                                            >
                                                <div>
                                                    <strong>{getUserDisplayName(requester || {})}</strong>
                                                    <p>{formatDate(request.requestDate)}</p>
                                                    {request.reason && <p>{request.reason}</p>}
                                                </div>

                                                <div className="dashboard-mini-actions">
                                                    <button
                                                        type="button"
                                                        className="dashboard-tag dashboard-tag-button"
                                                        onClick={() => handleApproveRequest(request.requestId)}
                                                        disabled={actionLoadingId === `approve-${request.requestId}`}
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="dashboard-tag dashboard-tag-button danger"
                                                        onClick={() => handleRejectRequest(request.requestId)}
                                                        disabled={actionLoadingId === `reject-${request.requestId}`}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </article>
                    </section>
                </>
            )}

            {isChef && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <p className="dashboard-section-kicker">Chef Tools</p>
                            <h2>Recipe Performance</h2>
                        </div>
                    </div>

                    <div className="dashboard-chef-card">
                        <div>
                            <span className="dashboard-chef-badge">🧑‍🍳 Chef Mode</span>
                            <h3>Manage your recipes beautifully</h3>
                            <p>
                                Create new recipes, update existing ones and track how users rate them.
                            </p>
                        </div>

                        <div className="dashboard-chef-stats">
                            <div>
                                <strong>{chefStats.myRecipesCount}</strong>
                                <span>My Recipes</span>
                            </div>

                            <div>
                                <strong>
                                    {chefStats.totalReviews === 0
                                        ? "—"
                                        : chefStats.averageRating.toFixed(1)}
                                </strong>
                                <span>Average Rating ⭐</span>
                            </div>

                            <div>
                                <strong>{chefStats.totalReviews}</strong>
                                <span>Total Reviews</span>
                            </div>
                        </div>

                        <div className="dashboard-button-row">
                            <button
                                type="button"
                                className="dashboard-primary-button"
                                onClick={() => navigate(ROUTES.chefRecipes)}
                            >
                                Manage My Recipes
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {!isAdmin && (
                <section className="dashboard-section">
                    <div className="dashboard-section-header">
                        <div>
                            <p className="dashboard-section-kicker">Smart Actions</p>
                            <h2>Alerts & Reminders</h2>
                        </div>
                    </div>

                    <div className="dashboard-alerts-grid">
                        <article className="dashboard-alert-panel">
                            <div className="dashboard-panel-header">
                                <span>⏳</span>
                                <div>
                                    <h3>Expiring Soon</h3>
                                    <p>Items that expire within 7 days.</p>
                                </div>
                            </div>

                            {expiringItems.length === 0 ? (
                                <EmptyState text="No expiring items found." />
                            ) : (
                                <div className="dashboard-mini-list">
                                    {expiringItems.slice(0, 4).map((item) => {
                                        const pantryItemId = getItemId(
                                            item,
                                            "pantryItemId",
                                            "id"
                                        );

                                        const daysLeft = getDaysUntilDate(
                                            item.expiryDate
                                        );

                                        return (
                                            <div
                                                className="dashboard-mini-item"
                                                key={pantryItemId}
                                            >
                                                <div>
                                                    <strong>
                                                        {getIngredientName(item.ingredientId)}
                                                    </strong>
                                                    <p>Expires: {formatDate(item.expiryDate)}</p>
                                                </div>

                                                <div className="dashboard-mini-actions">
                                                    <span className="dashboard-tag warning">
                                                        {daysLeft === 0
                                                            ? "Today"
                                                            : `${daysLeft} days`}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        className="dashboard-tag dashboard-tag-button"
                                                        onClick={() =>
                                                            addExpiringItemToShoppingList(item)
                                                        }
                                                        disabled={
                                                            actionLoadingId ===
                                                            `add-shopping-${pantryItemId}`
                                                        }
                                                    >
                                                        Add to shopping
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="dashboard-tag dashboard-tag-button danger"
                                                        onClick={() =>
                                                            removePantryItemFromDashboard(item)
                                                        }
                                                        disabled={
                                                            actionLoadingId ===
                                                            `remove-pantry-${pantryItemId}`
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </article>

                        <article className="dashboard-alert-panel">
                            <div className="dashboard-panel-header">
                                <span>🛒</span>
                                <div>
                                    <h3>Shopping Reminder</h3>
                                    <p>Open items from your shopping list.</p>
                                </div>
                            </div>

                            {openShoppingItems.length === 0 ? (
                                <EmptyState text="No shopping items." />
                            ) : (
                                <div className="dashboard-mini-list">
                                    {openShoppingItems.slice(0, 4).map((item) => {
                                        const shoppingItemId = getItemId(
                                            item,
                                            "shoppingItemId",
                                            "id"
                                        );

                                        return (
                                            <div
                                                className="dashboard-mini-item"
                                                key={shoppingItemId}
                                            >
                                                <div>
                                                    <strong>
                                                        {getIngredientName(item.ingredientId)}
                                                    </strong>
                                                    <p>
                                                        Quantity: {item.quantity} {item.unit}
                                                    </p>
                                                </div>

                                                <div className="dashboard-mini-actions">
                                                    <button
                                                        type="button"
                                                        className="dashboard-tag dashboard-tag-button"
                                                        onClick={() =>
                                                            markShoppingItemAsBought(item)
                                                        }
                                                        disabled={
                                                            actionLoadingId ===
                                                            `bought-${shoppingItemId}`
                                                        }
                                                    >
                                                        Bought
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="dashboard-tag dashboard-tag-button"
                                                        onClick={() =>
                                                            navigate(ROUTES.shoppingList)
                                                        }
                                                    >
                                                        Open list
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </article>

                        <article className="dashboard-alert-panel">
                            <div className="dashboard-panel-header">
                                <span>📅</span>
                                <div>
                                    <h3>Upcoming Meals</h3>
                                    <p>Your next planned meals.</p>
                                </div>
                            </div>

                            {upcomingMeals.length === 0 ? (
                                <EmptyState text="No meals planned." />
                            ) : (
                                <div className="dashboard-mini-list">
                                    {upcomingMeals.map((meal) => (
                                        <div
                                            className="dashboard-mini-item"
                                            key={meal.mealId || meal.id}
                                        >
                                            <div>
                                                <strong>
                                                    {meal.itemType === "recipe"
                                                        ? getRecipeTitle(meal.itemId)
                                                        : meal.mealType || "Meal"}
                                                </strong>

                                                <p>{formatDate(meal.date)}</p>

                                                {meal.notes && <p>{meal.notes}</p>}
                                            </div>

                                            <div className="dashboard-mini-actions">
                                                <span className="dashboard-tag">
                                                    {meal.mealType || "Meal"}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="dashboard-tag dashboard-tag-button"
                                                    onClick={() => openRecipeFromMeal(meal)}
                                                    disabled={meal.itemType !== "recipe" || !meal.itemId}
                                                >
                                                    Open
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </article>
                    </div>
                </section>
            )}

            {selectedRecipe && (
                <RecipeDetailsModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}
        </main>
    );
}

function ManagementCard({ icon, title, description, buttonLabel, onClick }) {
    return (
        <article className="dashboard-management-card">
            <span>{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>

            <button
                type="button"
                className="dashboard-secondary-button"
                onClick={onClick}
            >
                {buttonLabel}
            </button>
        </article>
    );
}

function EmptyState({ text }) {
    return (
        <div className="dashboard-empty-state">
            <span>🌿</span>
            <p>{text}</p>
        </div>
    );
}

export default Dashboard;