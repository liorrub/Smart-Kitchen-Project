import "./AIAssistant.css";

import { useEffect, useMemo, useState } from "react";

import AppButton from "../components/AppButton";
import FormCard from "../components/FormCard";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import {
    getAIHistory,
    generateRecipeFromPantry,
    getPersonalizedSuggestions,
    substituteIngredient as callSubstituteIngredient,
    deleteAIHistoryItem
} from "../services/aiHistoryService";
import { getIngredients } from "../services/ingredientsService";
import { getAuthHeaders } from "../utils/authUtils";
import { formatText } from "../utils/formatUtils";

const AI_FEATURES = [
    {
        id: "recipe-generator",
        title: "Generate Recipe from Pantry",
        description: "Select ingredients you have and let AI create a personalised recipe with your constraints.",
        icon: "🥘",
        accent: "green"
    },
    {
        id: "suggestions",
        title: "Personalised Suggestions",
        description: "Get 3 recipe ideas tailored to your dietary preferences, favourite cuisines, and cooking level.",
        icon: "✨",
        accent: "orange"
    },
    {
        id: "ingredient-substitute",
        title: "Ingredient Substitute",
        description: "Find a smart replacement for a specific ingredient due to dietary restrictions or availability.",
        icon: "🔁",
        accent: "pink"
    }
];

const REQUEST_TYPE_TO_FEATURE = {
    recipe_generation: "recipe-generator",
    suggestions: "suggestions",
    ingredient_substitute: "ingredient-substitute"
};

// ── Helpers (kept from original) ─────────────────────────────────────────────

function formatDate(value) {
    if (!value) return "No date";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInputSummary(inputData = {}) {
    const ingredients = inputData.ingredients || inputData.pantryItems;
    if (Array.isArray(ingredients) && ingredients.length > 0) return ingredients.join(", ");
    if (inputData.ingredient) return inputData.ingredient;
    if (inputData.imageName) return inputData.imageName;
    return "General request";
}

function getResultTitle(historyItem) {
    const result = historyItem.result || historyItem.outputData || {};
    if (result.recipeTitle) return result.recipeTitle;
    if (result.title) return result.title;
    if (result.detectedDish) return result.detectedDish;
    if (Array.isArray(result) && result[0]?.title) return result[0].title;
    if (Array.isArray(result) && result[0]?.substitute) return `${historyItem.inputData?.ingredient} substitutes`;
    if (Array.isArray(result.suggestedRecipes) && result.suggestedRecipes.length > 0) return result.suggestedRecipes[0];
    if (Array.isArray(result.suggestions) && result.suggestions.length > 0 && result.suggestions[0]?.title) return result.suggestions[0].title;
    return "AI conversation";
}

function getResultDescription(historyItem) {
    const result = historyItem.result || historyItem.outputData || {};
    if (result.description) return result.description;
    if (Array.isArray(result.suggestedRecipes)) return `Suggested recipes: ${result.suggestedRecipes.join(", ")}`;
    if (Array.isArray(result.instructions)) return result.instructions.join(", ");
    if (Array.isArray(result.detectedIngredients)) return `Detected: ${result.detectedIngredients.join(", ")}`;
    if (Array.isArray(result) && result[0]?.explanation) return result[0].explanation;
    return "This is where the assistant response from the saved conversation appears.";
}

function getHistoryColorClass(requestType) {
    switch (requestType) {
        case "recipe_generation":     return "ai-history-recipe";
        case "suggestions":           return "ai-history-suggestion";
        case "ingredient_substitute": return "ai-history-substitute";
        case "image_analysis":        return "ai-history-image";
        default:                      return "ai-history-general";
    }
}

function getHistoryLabel(requestType) {
    switch (requestType) {
        case "recipe_generation":     return "Recipe";
        case "suggestions":           return "Suggestions";
        case "ingredient_substitute": return "Substitute";
        default:                      return formatText(requestType);
    }
}

function normalizeHistory(history) {
    if (!Array.isArray(history)) return [];
    return history.map((item) => ({
        ...item,
        createDate: item.createDate || item.createdAt || item.date
    }));
}

// Build the chat message list for a selected history item, or return demo messages if none is selected.
function buildConversationMessages(historyItem) {
    if (!historyItem) {
        return [
            { id: "welcome",      sender: "assistant", text: "Hi! I can help you plan meals, suggest recipes and answer kitchen questions once the AI connection is added." },
            { id: "demo-question", sender: "user",      text: "Can you suggest dinner from my pantry?" },
            { id: "demo-answer",  sender: "assistant", text: "This chat is currently in demo mode. The real response will appear here after integration." }
        ];
    }
    return [
        { id: `${historyItem.historyId}-input`,  sender: "user",      text: getInputSummary(historyItem.inputData) },
        { id: `${historyItem.historyId}-result`, sender: "assistant", text: getResultDescription(historyItem) }
    ];
}

// ── Result sub-displays ──────────────────────────────────────────────────────

function RecipeDisplay({ recipe }) {
    if (!recipe || typeof recipe !== "object") return null;
    return (
        <div className="ai-result-recipe">
            <h3 className="ai-result-title">{recipe.title}</h3>
            {recipe.description && <p className="ai-result-desc">{recipe.description}</p>}

            <div className="ai-recipe-meta">
                {recipe.difficulty && <span className="ai-meta-badge">{formatText(recipe.difficulty)}</span>}
                {recipe.prepTime   && <span className="ai-meta-badge">Prep {recipe.prepTime} min</span>}
                {recipe.cookTime   && <span className="ai-meta-badge">Cook {recipe.cookTime} min</span>}
                {recipe.servings   && <span className="ai-meta-badge">{recipe.servings} servings</span>}
            </div>

            {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                <div className="ai-recipe-section">
                    <h4>Ingredients</h4>
                    <ul className="ai-recipe-list">
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 && (
                <div className="ai-recipe-section">
                    <h4>Instructions</h4>
                    <ol className="ai-recipe-steps">
                        {recipe.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ol>
                </div>
            )}

            {recipe.tips && <div className="ai-recipe-tips">💡 {recipe.tips}</div>}
        </div>
    );
}

function SuggestionsDisplay({ suggestions }) {
    if (!Array.isArray(suggestions)) return null;
    return (
        <div className="ai-result-suggestions">
            {suggestions.map((s, i) => (
                <div key={i} className="ai-suggestion-card">
                    <div className="ai-suggestion-header">
                        <h4>{s.title}</h4>
                        <div className="ai-suggestion-badges">
                            {s.cuisine       && <span className="ai-meta-badge">{formatText(s.cuisine)}</span>}
                            {s.difficulty    && <span className="ai-meta-badge">{formatText(s.difficulty)}</span>}
                            {s.estimatedTime && <span className="ai-meta-badge">{s.estimatedTime}</span>}
                        </div>
                    </div>
                    <p>{s.description}</p>
                    {Array.isArray(s.mainIngredients) && s.mainIngredients.length > 0 && (
                        <p className="ai-suggestion-ingredients">
                            <strong>Main ingredients:</strong> {s.mainIngredients.join(", ")}
                        </p>
                    )}
                    {s.whySuggested && <p className="ai-suggestion-why">✨ {s.whySuggested}</p>}
                </div>
            ))}
        </div>
    );
}

function SubstituteDisplay({ substitutes }) {
    if (!Array.isArray(substitutes)) return null;
    return (
        <div className="ai-result-substitutes">
            {substitutes.map((s, i) => (
                <div key={i} className="ai-substitute-card">
                    <h4>{s.substitute}</h4>
                    {s.preparation && <p><strong>Preparation:</strong> {s.preparation}</p>}
                    {s.ratio       && <p><strong>Ratio:</strong> {s.ratio}</p>}
                    {s.explanation && <p>{s.explanation}</p>}
                    {s.bestFor     && <p className="ai-substitute-best">Best for: {s.bestFor}</p>}
                </div>
            ))}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

function AIAssistant() {
    // ── Existing state (preserved) ──
    const [history, setHistory]               = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError]     = useState("");
    const [activeConversation, setActiveConversation] = useState(null);
    const [notice, setNotice]   = useState("");
    const [chatText, setChatText] = useState("");

    // ── New state ──
    const [allIngredients, setAllIngredients] = useState([]);
    const [activeFeature, setActiveFeature]   = useState(null);
    const [ingredientSearch, setIngredientSearch]       = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState([]);
    const [constraints, setConstraints] = useState({ difficulty: "", prepTime: "", cookTime: "", servings: "" });
    const [subForm, setSubForm] = useState({ ingredient: "", context: "", reason: "" });
    const [result, setResult]     = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError]   = useState("");

    // Load history and ingredient catalog on mount
    useEffect(() => {
        async function init() {
            try {
                setLoadingHistory(true);
                const [historyData, ingredientsData] = await Promise.all([
                    getAIHistory(),
                    getIngredients(getAuthHeaders())
                ]);
                setHistory(normalizeHistory(historyData));
                setAllIngredients(Array.isArray(ingredientsData) ? ingredientsData : []);
            } catch {
                setHistoryError("Could not load saved AI history. Showing empty state for now.");
            } finally {
                setLoadingHistory(false);
            }
        }
        init();
    }, []);

    async function refreshHistory() {
        try {
            const data = await getAIHistory();
            setHistory(normalizeHistory(data));
        } catch {
            // non-critical
        }
    }

    // ── Feature panel helpers ──
    function openFeature(featureId) {
        setActiveFeature(featureId);
        setResult(null);
        setAiError("");
        setSelectedIngredients([]);
        setIngredientSearch("");
        setConstraints({ difficulty: "", prepTime: "", cookTime: "", servings: "" });
        setSubForm({ ingredient: "", context: "", reason: "" });
        window.requestAnimationFrame(() => {
            document.querySelector(".ai-active-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function closeFeature() {
        setActiveFeature(null);
        setResult(null);
        setAiError("");
    }

    // Ingredient chip picker
    const filteredIngredients = allIngredients.filter((ing) => {
        const name = ing.name || "";
        return (
            name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
            !selectedIngredients.includes(name)
        );
    });

    function addIngredient(name) {
        if (!selectedIngredients.includes(name)) setSelectedIngredients((p) => [...p, name]);
        setIngredientSearch("");
    }

    function removeIngredient(name) {
        setSelectedIngredients((p) => p.filter((n) => n !== name));
    }

    // ── AI call handlers ──
    async function handleGenerateRecipe() {
        if (!selectedIngredients.length) return;
        setAiLoading(true);
        setAiError("");
        setResult(null);
        try {
            const data = await generateRecipeFromPantry(selectedIngredients, constraints);
            setResult({ type: "recipe_generation", data: data.generatedRecipe });
            await refreshHistory();
        } catch {
            setAiError("Failed to generate recipe. Please check your API key and try again.");
        } finally {
            setAiLoading(false);
        }
    }

    async function handleGetSuggestions() {
        setAiLoading(true);
        setAiError("");
        setResult(null);
        try {
            const data = await getPersonalizedSuggestions();
            setResult({ type: "suggestions", data: data.suggestions });
            await refreshHistory();
        } catch {
            setAiError("Failed to get suggestions. Please check your API key and try again.");
        } finally {
            setAiLoading(false);
        }
    }

    async function handleSubstitute(e) {
        e.preventDefault();
        if (!subForm.ingredient.trim()) return;
        setAiLoading(true);
        setAiError("");
        setResult(null);
        try {
            const data = await callSubstituteIngredient(subForm.ingredient, subForm.context, subForm.reason);
            setResult({ type: "ingredient_substitute", data: data.substitutes });
            await refreshHistory();
        } catch {
            setAiError("Failed to find substitutes. Please check your API key and try again.");
        } finally {
            setAiLoading(false);
        }
    }

    async function handleDeleteHistory(e, historyId) {
        e.stopPropagation();
        try {
            await deleteAIHistoryItem(historyId);
            setHistory((prev) => prev.filter((h) => h.historyId !== historyId));
        } catch {
            // silent
        }
    }

    // ── Existing handlers (preserved) ──

    // Show a notice that the AI chat is not yet connected to a real backend.
    function handleChatSubmit(event) {
        event.preventDefault();
        setNotice("AI chat is not connected yet. This chat interface is ready for the next implementation step.");
        setChatText("");
    }

    // Select a past conversation and scroll the chat window into view.
    // Also opens the matching inline feature panel to show the full result.
    function handleHistoryClick(historyItem) {
        setActiveConversation(historyItem);

        const featureId = REQUEST_TYPE_TO_FEATURE[historyItem.requestType];
        if (featureId) {
            setActiveFeature(featureId);
            setResult({ type: historyItem.requestType, data: historyItem.outputData, fromHistory: true });
            setAiError("");
            window.requestAnimationFrame(() => {
                document.querySelector(".ai-active-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        } else {
            window.requestAnimationFrame(() => {
                document.querySelector(".ai-chat-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    }

    const visibleHistory = useMemo(() => history, [history]);

    const chatMessages = useMemo(() => buildConversationMessages(activeConversation), [activeConversation]);

    // ── Render ──────────────────────────────────────────────────────────────

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
                description="Generate recipes, get personalised suggestions, and find ingredient substitutes — powered by Google Gemini."
                stats={[
                    { value: AI_FEATURES.length, label: "AI tools" },
                    { value: visibleHistory.length, label: "Past requests" },
                    { value: activeFeature ? "Active" : "Demo", label: "Chat mode" }
                ]}
            />

            {/* ── Feature cards ── */}
            <section className="ai-features-section">
                <div className="ai-section-heading">
                    <p>AI Features</p>
                    <h2>Choose an AI tool</h2>
                    <span>Select a feature to get AI-powered cooking assistance.</span>
                </div>

                <div className="ai-features-grid">
                    {AI_FEATURES.map((feature) => (
                        <article
                            key={feature.id}
                            className={[
                                "ai-feature-card",
                                `ai-feature-${feature.accent}`,
                                activeFeature === feature.id ? "ai-feature-active" : ""
                            ].filter(Boolean).join(" ")}
                        >
                            <div className="ai-feature-top-row">
                                <div className="ai-feature-icon">{feature.icon}</div>
                                <span className={`ai-feature-status ${activeFeature === feature.id ? "ai-feature-status-active" : ""}`}>
                                    {activeFeature === feature.id ? "Open" : "Ready"}
                                </span>
                            </div>

                            <div className="ai-feature-content">
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>

                            <AppButton
                                type="button"
                                onClick={() => activeFeature === feature.id ? closeFeature() : openFeature(feature.id)}
                            >
                                {activeFeature === feature.id ? "Close" : "Open"}
                            </AppButton>
                        </article>
                    ))}
                </div>
            </section>

            {/* ── Active feature inline panel ── */}
            {activeFeature && (
                <section className="ai-active-panel">
                    <div className="ai-panel-header">
                        <div className="ai-panel-title">
                            <span>{AI_FEATURES.find((f) => f.id === activeFeature)?.icon}</span>
                            <h2>{AI_FEATURES.find((f) => f.id === activeFeature)?.title}</h2>
                        </div>
                        <button type="button" className="ai-panel-close" onClick={closeFeature} aria-label="Close panel">×</button>
                    </div>

                    {/* Generate Recipe from Pantry */}
                    {activeFeature === "recipe-generator" && (
                        <div className="ai-panel-body">
                            <p className="ai-panel-hint">Search and select the ingredients you have available, then optionally set recipe constraints.</p>

                            {selectedIngredients.length > 0 && (
                                <div className="ai-selected-chips">
                                    {selectedIngredients.map((name) => (
                                        <span key={name} className="ai-chip">
                                            {name}
                                            <button
                                                type="button"
                                                className="ai-chip-remove"
                                                onClick={() => removeIngredient(name)}
                                                aria-label={`Remove ${name}`}
                                            >×</button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="ai-picker">
                                <input
                                    type="text"
                                    className="ai-picker-search"
                                    placeholder="Search ingredients..."
                                    value={ingredientSearch}
                                    onChange={(e) => setIngredientSearch(e.target.value)}
                                />
                                <div className="ai-picker-list">
                                    {filteredIngredients.length === 0 && (
                                        <p className="ai-picker-empty">
                                            {ingredientSearch ? "No matching ingredients." : "All ingredients already selected."}
                                        </p>
                                    )}
                                    {filteredIngredients.map((ing) => (
                                        <button
                                            key={ing.ingredientId}
                                            type="button"
                                            className="ai-picker-option"
                                            onClick={() => addIngredient(ing.name)}
                                        >
                                            + {ing.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="ai-constraints">
                                <div className="ai-constraint-field">
                                    <label>Difficulty</label>
                                    <select
                                        value={constraints.difficulty}
                                        onChange={(e) => setConstraints((p) => ({ ...p, difficulty: e.target.value }))}
                                    >
                                        <option value="">Any</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div className="ai-constraint-field">
                                    <label>Max prep time (min)</label>
                                    <input type="number" min="1" placeholder="e.g. 15" value={constraints.prepTime}
                                        onChange={(e) => setConstraints((p) => ({ ...p, prepTime: e.target.value }))} />
                                </div>
                                <div className="ai-constraint-field">
                                    <label>Max cook time (min)</label>
                                    <input type="number" min="1" placeholder="e.g. 30" value={constraints.cookTime}
                                        onChange={(e) => setConstraints((p) => ({ ...p, cookTime: e.target.value }))} />
                                </div>
                                <div className="ai-constraint-field">
                                    <label>Servings</label>
                                    <input type="number" min="1" placeholder="e.g. 2" value={constraints.servings}
                                        onChange={(e) => setConstraints((p) => ({ ...p, servings: e.target.value }))} />
                                </div>
                            </div>

                            <div className="ai-panel-actions">
                                <AppButton
                                    type="button"
                                    disabled={!selectedIngredients.length || aiLoading}
                                    onClick={handleGenerateRecipe}
                                >
                                    {aiLoading
                                        ? "Generating..."
                                        : `Generate Recipe (${selectedIngredients.length} ingredient${selectedIngredients.length !== 1 ? "s" : ""})`}
                                </AppButton>
                            </div>
                        </div>
                    )}

                    {/* Personalised Suggestions */}
                    {activeFeature === "suggestions" && (
                        <div className="ai-panel-body">
                            <p className="ai-panel-hint">
                                Gemini will generate 3 recipe ideas based on your dietary preferences, favourite cuisines, and cooking level saved in your profile.
                            </p>
                            <div className="ai-panel-actions">
                                <AppButton type="button" disabled={aiLoading} onClick={handleGetSuggestions}>
                                    {aiLoading ? "Getting suggestions..." : "Get My Suggestions"}
                                </AppButton>
                            </div>
                        </div>
                    )}

                    {/* Ingredient Substitute */}
                    {activeFeature === "ingredient-substitute" && (
                        <div className="ai-panel-body">
                            <p className="ai-panel-hint">
                                Enter a specific ingredient you want to replace. Optionally add the recipe name and your reason.
                            </p>
                            <form className="ai-sub-form" onSubmit={handleSubstitute}>
                                <div className="ai-sub-fields">
                                    <div className="ai-constraint-field ai-constraint-field--wide">
                                        <label>Ingredient to replace *</label>
                                        <input type="text" required placeholder="e.g. eggs, heavy cream, butter..."
                                            value={subForm.ingredient}
                                            onChange={(e) => setSubForm((p) => ({ ...p, ingredient: e.target.value }))} />
                                    </div>
                                    <div className="ai-constraint-field ai-constraint-field--wide">
                                        <label>Recipe context (optional)</label>
                                        <input type="text" placeholder="e.g. chocolate cake, pasta sauce..."
                                            value={subForm.context}
                                            onChange={(e) => setSubForm((p) => ({ ...p, context: e.target.value }))} />
                                    </div>
                                    <div className="ai-constraint-field ai-constraint-field--wide">
                                        <label>Reason (optional)</label>
                                        <input type="text" placeholder="e.g. vegan diet, missing ingredient, lactose intolerance..."
                                            value={subForm.reason}
                                            onChange={(e) => setSubForm((p) => ({ ...p, reason: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="ai-panel-actions">
                                    <AppButton type="submit" disabled={!subForm.ingredient.trim() || aiLoading}>
                                        {aiLoading ? "Finding substitutes..." : "Find Substitutes"}
                                    </AppButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {aiError && <div className="ai-error-banner">{aiError}</div>}

                    {aiLoading && (
                        <div className="ai-panel-loading">
                            <div className="ai-loading-spinner" />
                            <p>Gemini is thinking...</p>
                        </div>
                    )}

                    {result && !aiLoading && (
                        <div className="ai-result-container">
                            <div className="ai-result-label">
                                {result.fromHistory ? "📂 From history" : "✅ AI response"}
                            </div>
                            {result.type === "recipe_generation"     && <RecipeDisplay     recipe={result.data} />}
                            {result.type === "suggestions"           && <SuggestionsDisplay suggestions={result.data} />}
                            {result.type === "ingredient_substitute" && <SubstituteDisplay  substitutes={result.data} />}
                        </div>
                    )}
                </section>
            )}

            {/* ── Chat section (preserved as-is) ── */}
            <section className="ai-chat-section">
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="ai-chat-avatar">💬</div>

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

                    <form className="ai-chat-input-row" onSubmit={handleChatSubmit}>
                        <input
                            type="text"
                            value={chatText}
                            onChange={(e) => setChatText(e.target.value)}
                            placeholder={
                                activeConversation
                                    ? "Continue this conversation..."
                                    : "Ask the kitchen assistant..."
                            }
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </section>

            {/* ── History ── */}
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
                    <div className="ai-history-warning">{historyError}</div>
                )}

                {!loadingHistory && !historyError && history.length === 0 && (
                    <div className="ai-history-warning">No saved AI conversations yet.</div>
                )}

                {!loadingHistory && visibleHistory.length > 0 && (
                    <div className="ai-history-list">
                        {visibleHistory.map((historyItem) => (
                            <div
                                key={historyItem.historyId}
                                className={[
                                    "ai-history-row",
                                    getHistoryColorClass(historyItem.requestType),
                                    activeConversation?.historyId === historyItem.historyId ? "active" : ""
                                ].filter(Boolean).join(" ")}
                                onClick={() => handleHistoryClick(historyItem)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && handleHistoryClick(historyItem)}
                            >
                                <div className="ai-history-type">
                                    {getHistoryLabel(historyItem.requestType)}
                                </div>

                                <div className="ai-history-main">
                                    <strong>{getResultTitle(historyItem)}</strong>
                                    <span>{getInputSummary(historyItem.inputData)}</span>
                                </div>

                                <div className="ai-history-date">
                                    {formatDate(historyItem.createDate)}
                                </div>

                                <button
                                    type="button"
                                    className="ai-history-delete"
                                    onClick={(e) => handleDeleteHistory(e, historyItem.historyId)}
                                    aria-label="Delete history item"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </FormCard>
        </div>
    );
}

export default AIAssistant;
