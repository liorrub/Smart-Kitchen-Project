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
    },
    {
        label: "Ask AI",
        description: "Open kitchen chat",
        path: "/ai-assistant",
        icon: "AI"
    }
];

// Shown in the Chat History panel when the user has no real AI history yet.
const DEMO_CHAT_HISTORY = [
    {
        historyId: "sidebar-demo-1",
        requestType: "recipe_generation",
        title: "Quick Cheese Omelette",
        input: "egg, cheese, tomato",
        path: "/ai-assistant"
    },
    {
        historyId: "sidebar-demo-2",
        requestType: "smart_suggestion",
        title: "Simple Pasta",
        input: "pasta, tomato sauce, cheese",
        path: "/ai-assistant"
    },
    {
        historyId: "sidebar-demo-3",
        requestType: "image_analysis",
        title: "Pasta with tomato sauce",
        input: "pasta_dish.jpg",
        path: "/ai-assistant"
    }
];

const EMPTY_PANEL_DATA = {
    mealPlan: [],
    shoppingList: [],
    pantry: [],
    aiHistory: []
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

function formatText(value) {
    if (!value) {
        return "General";
    }

    return String(value)
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Summarize the user input from a history item for display in the chat history panel.
function getInputSummary(inputData = {}) {
    const ingredients = inputData.ingredients || inputData.pantryItems;

    if (Array.isArray(ingredients) && ingredients.length > 0) {
        return ingredients.join(", ");
    }

    if (inputData.imageName) {
        return inputData.imageName;
    }

    return "General request";
}

// Extract a display title from a history item's result data, checking multiple possible field names.
function getHistoryTitle(historyItem) {
    const result = historyItem.result || historyItem.outputData || {};

    if (historyItem.title) {
        return historyItem.title;
    }

    if (result.recipeTitle) {
        return result.recipeTitle;
    }

    if (result.title) {
        return result.title;
    }

    if (result.detectedDish) {
        return result.detectedDish;
    }

    if (
        Array.isArray(result.suggestedRecipes) &&
        result.suggestedRecipes.length > 0
    ) {
        return result.suggestedRecipes[0];
    }

    return "AI conversation";
}

// Return the user's input text for a history entry, checking the direct field first.
function getHistoryInput(historyItem) {
    if (historyItem.input) {
        return historyItem.input;
    }

    return getInputSummary(historyItem.inputData);
}

// Map a request type to its CSS tone class for styling the chat history item.
function getHistoryTone(requestType) {
    switch (requestType) {
        case "recipe_generation":
            return "recipe";

        case "smart_suggestion":
        case "suggestions":
            return "suggestion";

        case "image_analysis":
            return "image";

        default:
            return "general";
    }
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

    // Load the user's meal plan, shopping list, pantry, and AI history for the sidebar panels.
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
                    pantry,
                    aiHistory
                ] = await Promise.all([
                    safeFetch(`${API_BASE_URL}/users/${userId}/meal-plan`, headers),
                    safeFetch(`${API_BASE_URL}/users/${userId}/shopping-list`, headers),
                    safeFetch(`${API_BASE_URL}/users/${userId}/pantry`, headers),
                    safeFetch(`${API_BASE_URL}/users/${userId}/ai/history`, headers)
                ]);

                setPanelData({
                    mealPlan,
                    shoppingList,
                    pantry,
                    aiHistory
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

    // Show the 3 most recent real AI history entries, or fall back to demo entries if none exist.
    const visibleChatHistory = useMemo(() => {
        if (panelData.aiHistory.length > 0) {
            return panelData.aiHistory.slice(0, 3);
        }

        return DEMO_CHAT_HISTORY;
    }, [panelData.aiHistory]);

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

    // Navigate to the AI Assistant page with the selected conversation ID as a query param.
    function handleChatHistoryClick(historyItem) {
        const url = new URL(window.location.origin + "/ai-assistant");

        url.searchParams.set(
            "conversation",
            historyItem.historyId || historyItem.id || "demo"
        );

        navigate(`${url.pathname}${url.search}`);
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
                            <span>Chat History</span>
                        </div>

                        <div className="sidebar-chat-history">
                            {visibleChatHistory.map((historyItem) => (
                                <button
                                    key={historyItem.historyId || historyItem.id}
                                    type="button"
                                    className={`sidebar-chat-row ${getHistoryTone(historyItem.requestType)}`}
                                    onClick={() =>
                                        handleChatHistoryClick(historyItem)
                                    }
                                >
                                    <span className="chat-history-type">
                                        {formatText(historyItem.requestType)}
                                    </span>

                                    <strong>
                                        {getHistoryTitle(historyItem)}
                                    </strong>

                                    <small>
                                        {getHistoryInput(historyItem)}
                                    </small>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="sidebar-ai-card">
                        <div>
                            <p>AI Assistant</p>
                            <h3>Ask Smart Kitchen AI</h3>
                            <span>
                                Get recipe ideas, substitutions and meal suggestions.
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleNavigate("/ai-assistant")}
                        >
                            Open AI Chat
                        </button>
                    </section>
                </div>
            </aside>
        </>
    );
}

export default KitchenSidebar;
