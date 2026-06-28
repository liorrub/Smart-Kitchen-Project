import "./Sidebar.css";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getResponseData } from "../utils/apiUtils";
import { getStoredUser, getUserRole, getAuthHeadersForUser } from "../utils/authUtils";
import { toLocalDateKey } from "../utils/dateUtils";
import { API_BASE_URL } from "../utils/apiConfig";

const QUICK_ACTIONS = [
    {
        label: "Add Meal",
        description: "Plan today's meals",
        path: "/meal-planner",
        icon: "+"
    },
    {
        label: "Add Recipe",
        description: "Manage recipes",
        path: "/recipe-management",
        icon: "+",
        showForRoles: ["chef", "admin"]
    },
    {
        label: "My Recipes",
        description: "View my submissions",
        path: "/foodie/my-recipes",
        icon: "+",
        showForRoles: ["influencer"]
    },
    {
        label: "Add Ingredient",
        description: "Update ingredients",
        path: "/ingredients",
        icon: "+",
        showForRoles: ["admin"]
    }
];

const AI_TOOL_LINKS = [
    {
        label: "Recipe Generator",
        description: "Generate from pantry",
        icon: "🥘",
        path: "/ai-assistant?feature=recipe-generator"
    },
    {
        label: "Personalized Suggestions",
        description: "Tailored recipe ideas",
        icon: "✨",
        path: "/ai-assistant?feature=suggestions"
    },
    {
        label: "Ingredient Substitute",
        description: "Find replacements",
        icon: "🔁",
        path: "/ai-assistant?feature=ingredient-substitute"
    }
];

const EMPTY_PANEL_DATA = {
    mealPlan: [],
    shoppingList: [],
    pantry: []
};

function getAuthHeaders(user) {
    return getAuthHeadersForUser(user || getStoredUser());
}

// Normalize a response value to an array regardless of the API shape returned.
function normalizeArray(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.items)) {
        return value.items;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    return [];
}

// Return the first non-empty numeric value from the provided candidates, or 0 as a fallback.
function getNumericValue(...values) {
    const numericValue = values.find(
        (value) =>
            value !== undefined &&
            value !== null &&
            value !== "" &&
            !Number.isNaN(Number(value))
    );

    return Number(numericValue || 0);
}

// Fetch a list endpoint and return an empty array on any error so a single
// failing request does not break the entire sidebar panel.
async function safeFetch(url, headers) {
    try {
        const response = await axios.get(url, {
            headers,
            params: {
                _t: Date.now()
            }
        });

        return normalizeArray(getResponseData(response));
    } catch (error) {
        console.warn(`Kitchen sidebar failed to load ${url}`, error);

        return [];
    }
}

function KitchenSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [panelData, setPanelData] = useState(EMPTY_PANEL_DATA);
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useAuth();
    const navigate = useNavigate();

    const currentUser = user || getStoredUser();
    const currentUserRole = getUserRole(currentUser);

    const todayKey = toLocalDateKey(new Date());

    // Load the user's meal plan, shopping list, and pantry for the sidebar panels.
    useEffect(() => {
        async function loadPanelData() {
            const currentUser = user || getStoredUser();

            if (!currentUser?.userId) {
                setPanelData(EMPTY_PANEL_DATA);
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                const headers = getAuthHeaders(currentUser);
                const userId = currentUser.userId;

                const [
                    mealPlan,
                    shoppingList,
                    pantry
                ] = await Promise.all([
                    safeFetch(`${API_BASE_URL}/users/${userId}/meal-plan`, headers),
                    safeFetch(`${API_BASE_URL}/users/${userId}/shopping-list`, headers),
                    safeFetch(`${API_BASE_URL}/users/${userId}/pantry`, headers)
                ]);

                setPanelData({
                    mealPlan,
                    shoppingList,
                    pantry
                });
            } finally {
                setIsLoading(false);
            }
        }

        loadPanelData();
    }, [user]);

    // Close the sidebar when the user presses Escape.
    useEffect(() => {
        function handleEscape(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    // Lock page scroll while the sidebar is open and restore it when closed.
    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;

        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        }

        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, [isOpen]);

    // Filter meal plan entries that are scheduled for today.
    const todayMeals = useMemo(() => {
        return panelData.mealPlan.filter((meal) => meal.date === todayKey);
    }, [panelData.mealPlan, todayKey]);

    // Sum the calories of all today's meals, checking multiple possible calorie field names.
    const todayCalories = useMemo(() => {
        return todayMeals.reduce((sum, meal) => {
            return (
                sum +
                getNumericValue(
                    meal.calories,
                    meal.recipeCalories,
                    meal.totalCalories
                )
            );
        }, 0);
    }, [todayMeals]);

    // Count shopping items that have not been marked as completed.
    const shoppingItemsCount = useMemo(() => {
        return panelData.shoppingList.filter((item) => {
            return !item.isCompleted && !item.completed && item.status !== "done";
        }).length;
    }, [panelData.shoppingList]);

    // Find pantry items where the current quantity is at or below the minimum threshold.
    const lowPantryItems = useMemo(() => {
        return panelData.pantry.filter((item) => {
            const quantity = getNumericValue(
                item.quantity,
                item.currentQuantity,
                item.amount,
                item.stock
            );

            const minimum = getNumericValue(
                item.minimumQuantity,
                item.minQuantity,
                item.lowStockThreshold,
                1
            );

            return quantity > 0 && quantity <= minimum;
        });
    }, [panelData.pantry]);

    // Check whether a dinner meal is already planned for today.
    const hasDinnerToday = useMemo(() => {
        return todayMeals.some((meal) => meal.mealType === "dinner");
    }, [todayMeals]);

    // Build a short list of actionable alerts based on the user's current kitchen data.
    const smartAlerts = useMemo(() => {
        const alerts = [];

        if (!hasDinnerToday) {
            alerts.push({
                title: "No dinner planned today",
                tone: "warning"
            });
        }

        if (shoppingItemsCount > 0) {
            alerts.push({
                title: `${shoppingItemsCount} shopping items waiting`,
                tone: "shopping"
            });
        }

        if (lowPantryItems.length > 0) {
            alerts.push({
                title: `${lowPantryItems.length} pantry items are low`,
                tone: "info"
            });
        }

        if (alerts.length === 0) {
            alerts.push({
                title: "Your kitchen overview looks balanced",
                tone: "success"
            });
        }

        return alerts.slice(0, 3);
    }, [hasDinnerToday, shoppingItemsCount, lowPantryItems.length]);

    const snapshotItems = [
        {
            label: "Meals today",
            value: todayMeals.length
        },
        {
            label: "Calories",
            value: todayCalories
        },
        {
            label: "Shopping",
            value: shoppingItemsCount
        },
        {
            label: "Low stock",
            value: lowPantryItems.length
        }
    ];

    // Navigate to a page and close the sidebar at the same time.
    function handleNavigate(path) {
        navigate(path);
        setIsOpen(false);
    }

    return (
        <>
            <button
                type="button"
                className="kitchen-panel-button"
                onClick={() => setIsOpen(true)}
                aria-label="Open kitchen panel"
            >
                <span />
                <span />
                <span />
            </button>

            {isOpen && (
                <button
                    type="button"
                    className="kitchen-sidebar-backdrop"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close kitchen panel"
                />
            )}

            <aside
                className={
                    isOpen
                        ? "kitchen-sidebar open"
                        : "kitchen-sidebar"
                }
                aria-hidden={!isOpen}
            >
                <div className="sidebar-header">
                    <div className="sidebar-mark">
                        SK
                    </div>

                    <button
                        type="button"
                        className="sidebar-close"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close kitchen panel"
                    >
                        ×
                    </button>
                </div>

                <div className="sidebar-scroll">
                    <section className="sidebar-section today-section">
                        <div className="sidebar-section-title">
                            <span>Today</span>
                            {isLoading && <small>Syncing</small>}
                        </div>

                        <div className="today-grid">
                            {snapshotItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="today-card"
                                >
                                    <strong>{item.value}</strong>
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="sidebar-section">
                        <div className="sidebar-section-title">
                            <span>Quick Actions</span>
                        </div>

                        <div className="quick-actions-list">
                            {QUICK_ACTIONS.filter(action => !action.showForRoles || action.showForRoles.includes(currentUserRole)).map((action) => (
                                <button
                                    key={action.label}
                                    type="button"
                                    className="quick-action"
                                    onClick={() => handleNavigate(action.path)}
                                >
                                    <span className="quick-action-icon">
                                        {action.icon}
                                    </span>

                                    <span className="quick-action-text">
                                        <strong>{action.label}</strong>
                                        <small>{action.description}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="sidebar-section">
                        <div className="sidebar-section-title">
                            <span>Smart Alerts</span>
                        </div>

                        <div className="alerts-list">
                            {smartAlerts.map((alert) => (
                                <div
                                    key={alert.title}
                                    className={`smart-alert ${alert.tone}`}
                                >
                                    <span />
                                    <p>{alert.title}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="sidebar-section">
                        <div className="sidebar-section-title">
                            <span>AI Tools</span>
                        </div>

                        <div className="quick-actions-list">
                            {AI_TOOL_LINKS.map((tool) => (
                                <button
                                    key={tool.label}
                                    type="button"
                                    className="quick-action"
                                    onClick={() => handleNavigate(tool.path)}
                                >
                                    <span className="quick-action-icon">
                                        {tool.icon}
                                    </span>

                                    <span className="quick-action-text">
                                        <strong>{tool.label}</strong>
                                        <small>{tool.description}</small>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </aside>
        </>
    );
}

export default KitchenSidebar;
