import "./AIAssistant.css";

import { useEffect, useMemo, useState } from "react";

import AppButton from "../components/AppButton";
import FormCard from "../components/FormCard";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import { getAIHistory } from "../services/aiHistoryService";
import { formatText } from "../utils/formatUtils";

const AI_FEATURES = [
    {
        id: "recipe-generator",
        title: "Generate Recipe from Pantry",
        description:
            "Create a recipe idea based on ingredients that already exist in your pantry.",
        buttonText: "Open",
        icon: "🥘",
        accent: "green"
    },
    {
        id: "image-analysis",
        title: "Analyze Food Image",
        description:
            "Upload a food image and get recipe suggestions based on the dish.",
        buttonText: "Open",
        icon: "📸",
        accent: "orange"
    },
    {
        id: "ingredient-substitute",
        title: "Ingredient Substitute",
        description:
            "Find a smart substitute when a recipe is missing an ingredient.",
        buttonText: "Open",
        icon: "🔁",
        accent: "pink"
    }
];


// Format a raw date value as a human-readable "Mon DD, YYYY" string.
function formatDate(value) {
    if (!value) {
        return "No date";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// Summarize the user input from a history entry for display in the history list.
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

// Extract a display title from the AI result of a history item, checking multiple possible result shapes.
function getResultTitle(historyItem) {
    const result = historyItem.result || historyItem.outputData || {};

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

    if (
        Array.isArray(result.suggestions) &&
        result.suggestions.length > 0 &&
        result.suggestions[0]?.title
    ) {
        return result.suggestions[0].title;
    }

    return "AI conversation";
}

// Extract a readable description from the AI result, checking multiple possible result shapes.
function getResultDescription(historyItem) {
    const result = historyItem.result || historyItem.outputData || {};

    if (result.description) {
        return result.description;
    }

    if (Array.isArray(result.suggestedRecipes)) {
        return `Suggested recipes: ${result.suggestedRecipes.join(", ")}`;
    }

    if (Array.isArray(result.instructions)) {
        return result.instructions.join(", ");
    }

    if (Array.isArray(result.detectedIngredients)) {
        return `Detected ingredients: ${result.detectedIngredients.join(", ")}`;
    }

    return "This is where the assistant response from the saved conversation appears.";
}

// Map a request type string to its CSS color class for the history list item.
function getHistoryColorClass(requestType) {
    switch (requestType) {
        case "recipe_generation":
            return "ai-history-recipe";

        case "smart_suggestion":
        case "suggestions":
            return "ai-history-suggestion";

        case "image_analysis":
            return "ai-history-image";

        default:
            return "ai-history-general";
    }
}

// Normalize date field names across history items so the list always uses createDate.
function normalizeHistory(history) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history.map((item) => ({
        ...item,
        createDate: item.createDate || item.createdAt || item.date
    }));
}

// Build the chat message list for a selected history item, or return demo messages if none is selected.
function buildConversationMessages(historyItem) {
    if (!historyItem) {
        return [
            {
                id: "welcome",
                sender: "assistant",
                text:
                    "Hi! I can help you plan meals, suggest recipes and answer kitchen questions once the AI connection is added."
            },
            {
                id: "demo-question",
                sender: "user",
                text: "Can you suggest dinner from my pantry?"
            },
            {
                id: "demo-answer",
                sender: "assistant",
                text:
                    "This chat is currently in demo mode. The real response will appear here after integration."
            }
        ];
    }

    return [
        {
            id: `${historyItem.historyId}-input`,
            sender: "user",
            text: getInputSummary(historyItem.inputData)
        },
        {
            id: `${historyItem.historyId}-result`,
            sender: "assistant",
            text: getResultDescription(historyItem)
        }
    ];
}

function AIAssistant() {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState("");
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [notice, setNotice] = useState("");
    const [chatText, setChatText] = useState("");

    // Load AI conversation history when the page opens.
    useEffect(() => {
        async function loadHistory() {
            try {
                setLoadingHistory(true);
                setHistoryError("");

                const data = await getAIHistory();

                setHistory(normalizeHistory(data));
            } catch (error) {
                console.error("AI history loading error:", error);

                setHistoryError(
                    "Could not load saved AI history. Showing sample conversations for now."
                );
            } finally {
                setLoadingHistory(false);
            }
        }

        loadHistory();
    }, []);

    const visibleHistory = useMemo(() => {
        return history;
    }, [history]);

    const chatMessages = useMemo(() => {
        return buildConversationMessages(activeConversation);
    }, [activeConversation]);

    // Show a notice that the AI chat is not yet connected to a real backend.
    function handleChatSubmit(event) {
        event.preventDefault();

        setNotice(
            "AI chat is not connected yet. This chat interface is ready for the next implementation step."
        );
        setChatText("");
    }

    // Select a past conversation and scroll the chat window into view.
    function handleHistoryClick(historyItem) {
        setActiveConversation(historyItem);

        window.requestAnimationFrame(() => {
            document
                .querySelector(".ai-chat-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        });
    }

    if (selectedFeature) {
        return (
            <div className="ai-assistant-page">
                <PageHero
                    label="Coming Soon"
                    title={selectedFeature.title}
                    description="This page is under construction. The real AI connection will be added later."
                    stats={[
                        {
                            value: "Soon",
                            label: "Status"
                        },
                        {
                            value: "AI",
                            label: "Feature"
                        },
                        {
                            value: "Demo",
                            label: "Mode"
                        }
                    ]}
                />

                <FormCard
                    label="Temporary page"
                    title="This page is under construction"
                    description="This feature is planned for the AI module. For now, the page is available as a placeholder so the navigation and design stay complete."
                    className="ai-coming-soon-card"
                    actions={
                        <AppButton
                            type="button"
                            variant="secondary"
                            onClick={() => setSelectedFeature(null)}
                        >
                            Back to AI tools
                        </AppButton>
                    }
                >
                    <div className="ai-coming-soon-content">
                        <div className="ai-coming-soon-icon">
                            {selectedFeature.icon}
                        </div>

                        <div>
                            <h3>{selectedFeature.title}</h3>

                            <p>
                                This area will connect to the real AI service in a future implementation step.
                            </p>
                        </div>
                    </div>
                </FormCard>
            </div>
        );
    }

    return (
        <div className="ai-assistant-page">
            <MessageModal
                type="success"
                title="AI Assistant"
                message={notice}
                onClose={() => setNotice("")}
            />

            <PageHero
                label="AI Assistant"
                title="Smart tools for smarter cooking"
                description="Explore planned AI tools for recipes, food images, ingredient substitutes and kitchen chat."
                stats={[
                    {
                        value: AI_FEATURES.length + 1,
                        label: "AI tools"
                    },
                    {
                        value: visibleHistory.length,
                        label: "Past prompts"
                    },
                    {
                        value: activeConversation ? "Open" : "Demo",
                        label: "Chat mode"
                    }
                ]}
            />

            <section className="ai-features-section">
                <div className="ai-section-heading">
                    <p>AI Features</p>

                    <h2>Additional AI tools</h2>

                    <span>
                        These tools open temporary under-construction pages until the real AI implementation is connected.
                    </span>
                </div>

                <div className="ai-features-grid">
                    {AI_FEATURES.map((feature) => (
                        <article
                            key={feature.id}
                            className={`ai-feature-card ai-feature-${feature.accent}`}
                        >
                            <div className="ai-feature-top-row">
                                <div className="ai-feature-icon">
                                    {feature.icon}
                                </div>

                                <span className="ai-feature-status">
                                    Coming soon
                                </span>
                            </div>

                            <div className="ai-feature-content">
                                <h3>{feature.title}</h3>

                                <p>{feature.description}</p>
                            </div>

                            <AppButton
                                type="button"
                                onClick={() => setSelectedFeature(feature)}
                            >
                                {feature.buttonText}
                            </AppButton>
                        </article>
                    ))}
                </div>
            </section>

            <section className="ai-chat-section">
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-avatar">
                            💬
                        </div>

                        <div>
                            <p>AI Chat</p>

                            <h2>
                                {activeConversation
                                    ? getResultTitle(activeConversation)
                                    : "Kitchen assistant chat"}
                            </h2>

                            <span>
                                {activeConversation
                                    ? "Resumed conversation · demo mode"
                                    : "Demo chat · not connected yet"}
                            </span>
                        </div>

                        {activeConversation && (
                            <button
                                type="button"
                                className="ai-new-chat-button"
                                onClick={() => setActiveConversation(null)}
                            >
                                New chat
                            </button>
                        )}
                    </div>

                    <div className="ai-chat-messages">
                        {chatMessages.map((message) => (
                            <div
                                key={message.id}
                                className={
                                    message.sender === "user"
                                        ? "ai-message ai-message-user"
                                        : "ai-message ai-message-assistant"
                                }
                            >
                                <p>{message.text}</p>
                            </div>
                        ))}
                    </div>

                    <form
                        className="ai-chat-input-row"
                        onSubmit={handleChatSubmit}
                    >
                        <input
                            type="text"
                            value={chatText}
                            onChange={(event) =>
                                setChatText(event.target.value)
                            }
                            placeholder={
                                activeConversation
                                    ? "Continue this conversation..."
                                    : "Ask the kitchen assistant..."
                            }
                        />

                        <button type="submit">
                            Send
                        </button>
                    </form>
                </div>
            </section>

            <FormCard
                label="History"
                title="Previous AI Conversations"
                description="Click a previous conversation to open it in the chat and continue where you stopped."
                className="ai-history-card"
            >
                {loadingHistory && (
                    <div className="ai-history-state">
                        <div className="ai-loading-spinner" />

                        <p>Loading AI history...</p>
                    </div>
                )}

                {!loadingHistory && historyError && (
                    <div className="ai-history-warning">
                        {historyError}
                    </div>
                )}

                {!loadingHistory && !historyError && history.length === 0 && (
                    <div className="ai-history-warning">
                        No saved AI conversations yet.
                    </div>
                )}

                {!loadingHistory && visibleHistory.length > 0 && (
                    <div className="ai-history-list">
                        {visibleHistory.map((historyItem) => (
                            <button
                                key={historyItem.historyId}
                                type="button"
                                className={[
                                    "ai-history-row",
                                    getHistoryColorClass(historyItem.requestType),
                                    activeConversation?.historyId ===
                                    historyItem.historyId
                                        ? "active"
                                        : ""
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => handleHistoryClick(historyItem)}
                            >
                                <div className="ai-history-type">
                                    {formatText(historyItem.requestType)}
                                </div>

                                <div className="ai-history-main">
                                    <strong>{getResultTitle(historyItem)}</strong>

                                    <span>
                                        {getInputSummary(historyItem.inputData)}
                                    </span>
                                </div>

                                <div className="ai-history-date">
                                    {formatDate(historyItem.createDate)}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </FormCard>
        </div>
    );
}

export default AIAssistant;
