import "./AIAssistant.css";
import "./AIResultCards.css";
import "../components/RecipeCard.css";
import "../components/RecipeDetailsModal.css";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import AppButton from "../components/AppButton";
import FormCard from "../components/FormCard";
import MultiIngredientPicker from "../components/MultiIngredientPicker";
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

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    return "AI request";
}

function getHistoryColorClass(requestType) {
    switch (requestType) {
        case "recipe_generation":     return "ai-history-recipe";
        case "suggestions":           return "ai-history-suggestion";
        case "ingredient_substitute": return "ai-history-substitute";
        default:                      return "ai-history-general";
    }
}

function getHistoryLabel(requestType) {
    switch (requestType) {
        case "recipe_generation":     return "Recipe Generation";
        case "suggestions":           return "Personalized Suggestion";
        case "ingredient_substitute": return "Ingredient Substitute";
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

// ── Result sub-displays ──────────────────────────────────────────────────────

function RecipeDisplay({ recipe }) {
    if (!recipe || typeof recipe !== "object") return null;

    const hasMetaInfo = recipe.difficulty || recipe.prepTime || recipe.cookTime || recipe.servings;

    return (
        <div className="ai-recipe-card">
            <div className="ai-recipe-card-header">
                <div className="ai-recipe-card-icon">🥘</div>
                <div className="ai-recipe-card-title-block">
                    {recipe.cuisine && (
                        <span className="ai-recipe-cuisine-badge">{formatText(recipe.cuisine)} cuisine</span>
                    )}
                    <h3 className="ai-recipe-card-title">{recipe.title}</h3>
                    {recipe.description && <p className="ai-recipe-card-desc">{recipe.description}</p>}
                </div>
            </div>

            {hasMetaInfo && (
                <div className="ai-recipe-meta-row">
                    {recipe.difficulty && <span className="ai-meta-badge ai-meta-badge--difficulty">{formatText(recipe.difficulty)}</span>}
                    {recipe.prepTime   && <span className="ai-meta-badge">⏱ Prep {recipe.prepTime} min</span>}
                    {recipe.cookTime   && <span className="ai-meta-badge">🔥 Cook {recipe.cookTime} min</span>}
                    {recipe.servings   && <span className="ai-meta-badge">👥 {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}</span>}
                </div>
            )}

            <div className="ai-recipe-card-body">
                {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 && (
                    <div className="ai-recipe-section">
                        <div className="ai-recipe-section-label">
                            <span>🧂</span> Ingredients
                        </div>
                        <ul className="ai-ingredient-list">
                            {recipe.ingredients.map((ing, i) => (
                                <li key={i} className="ai-ingredient-item">
                                    <span className="ai-ingredient-qty">{ing.quantity} {ing.unit}</span>
                                    <span className="ai-ingredient-name">{ing.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {Array.isArray(recipe.instructions) && recipe.instructions.length > 0 && (
                    <div className="ai-recipe-section">
                        <div className="ai-recipe-section-label">
                            <span>📋</span> Instructions
                        </div>
                        <ol className="ai-step-list">
                            {recipe.instructions.map((step, i) => (
                                <li key={i} className="ai-step-item">
                                    <span className="ai-step-number">{i + 1}</span>
                                    <span className="ai-step-text">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {recipe.tips && (
                    <div className="ai-recipe-tips">
                        <span>💡</span>
                        <span>{recipe.tips}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function SuggestionCards({ suggestions, onSelect }) {
    if (!Array.isArray(suggestions)) return null;
    return (
        <div className="ai-sugg-grid">
            {suggestions.map((s, i) => (
                <article key={i} className="recipe-card recipe-card-default">
                    <div className="recipe-card-inner">
                        <div className="recipe-card-header">
                            <div className="recipe-card-image-wrapper">
                                <span className="ai-sugg-emoji">✨</span>
                            </div>
                            <span className="recipe-card-category">#{i + 1}</span>
                        </div>

                        <div className="recipe-card-content">
                            <h3>{s.title}</h3>
                            <div className="recipe-card-meta">
                                {s.estimatedTime && <span>⏱ {s.estimatedTime}</span>}
                                {s.difficulty    && <span>{formatText(s.difficulty)}</span>}
                            </div>
                            {s.description && (
                                <p className="ai-sugg-card-desc">{s.description}</p>
                            )}
                            {Array.isArray(s.mainIngredients) && s.mainIngredients.length > 0 && (
                                <div className="recipe-card-tags">
                                    {s.mainIngredients.slice(0, 3).map((ing, j) => (
                                        <span key={j}>#{ing}</span>
                                    ))}
                                    {s.mainIngredients.length > 3 && (
                                        <span>+{s.mainIngredients.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="recipe-card-footer">
                            <span className="recipe-card-cuisine">
                                {s.cuisine ? formatText(s.cuisine) + " cuisine" : "AI generated"}
                            </span>
                            <div className="recipe-card-actions">
                                <button
                                    type="button"
                                    className="recipe-card-view-button"
                                    onClick={() => onSelect(s, i)}
                                >
                                    View Recipe
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

function AISuggestionModal({ suggestion, index, onClose }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="recipe-modal-overlay" onClick={onClose}>
            <div
                className="recipe-modal recipe-modal-default"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="recipe-modal-close"
                    onClick={onClose}
                    aria-label="Close suggestion"
                >
                    ×
                </button>

                <div className="recipe-modal-body">
                    <header className="recipe-modal-header">
                        <p className="recipe-modal-label">AI Suggestion #{index + 1}</p>
                        <h2>{suggestion.title}</h2>
                        {(suggestion.cuisine || suggestion.difficulty) && (
                            <p className="recipe-modal-subtitle">
                                {[
                                    suggestion.cuisine    && formatText(suggestion.cuisine) + " cuisine",
                                    suggestion.difficulty && formatText(suggestion.difficulty)
                                ].filter(Boolean).join(" · ")}
                            </p>
                        )}
                    </header>

                    <section className="recipe-modal-stats ai-sugg-stats">
                        {suggestion.estimatedTime && (
                            <div className="recipe-modal-stat">
                                <strong>{suggestion.estimatedTime}</strong>
                                <span>Est. time</span>
                            </div>
                        )}
                        {suggestion.difficulty && (
                            <div className="recipe-modal-stat">
                                <strong>{formatText(suggestion.difficulty)}</strong>
                                <span>Difficulty</span>
                            </div>
                        )}
                        {suggestion.cuisine && (
                            <div className="recipe-modal-stat">
                                <strong>{formatText(suggestion.cuisine)}</strong>
                                <span>Cuisine</span>
                            </div>
                        )}
                    </section>

                    {suggestion.description && (
                        <p className="ai-sugg-modal-desc">{suggestion.description}</p>
                    )}

                    <section className="recipe-main-grid">
                        <article className="recipe-detail-card">
                            <div className="recipe-card-title">
                                <span>🧂</span>
                                <h3>Main Ingredients</h3>
                            </div>
                            {Array.isArray(suggestion.mainIngredients) && suggestion.mainIngredients.length > 0 ? (
                                <ul className="ai-sugg-ing-list">
                                    {suggestion.mainIngredients.map((ing, j) => (
                                        <li key={j}>{ing}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="recipe-empty-text">No ingredients listed.</p>
                            )}
                        </article>

                        {suggestion.whySuggested && (
                            <article className="recipe-detail-card">
                                <div className="recipe-card-title">
                                    <span>✨</span>
                                    <h3>Why This Recipe?</h3>
                                </div>
                                <p className="ai-sugg-modal-why">{suggestion.whySuggested}</p>
                            </article>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function SubstituteDisplay({ substitutes }) {
    if (!Array.isArray(substitutes)) return null;
    return (
        <div className="ai-substitutes-list">
            {substitutes.map((s, i) => (
                <div key={i} className="ai-substitute-card">
                    <div className="ai-substitute-header">
                        <span className="ai-substitute-number">{i + 1}</span>
                        <div className="ai-substitute-title-block">
                            <h4 className="ai-substitute-name">{s.substitute}</h4>
                            {s.ratio && <span className="ai-substitute-ratio">{s.ratio}</span>}
                        </div>
                    </div>
                    {s.preparation && (
                        <div className="ai-substitute-prep">
                            <strong>Preparation:</strong> {s.preparation}
                        </div>
                    )}
                    {s.explanation && <p className="ai-substitute-explanation">{s.explanation}</p>}
                    {s.bestFor && (
                        <div className="ai-substitute-best">
                            <span>✅</span>
                            <span>Best for: {s.bestFor}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

function AIAssistant() {
    const [searchParams] = useSearchParams();

    // History state
    const [history, setHistory]               = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError]     = useState("");

    // Feature state
    const [allIngredients, setAllIngredients]   = useState([]);
    const [activeFeature, setActiveFeature]     = useState(null);
    const [selectedIngredientIds, setSelectedIngredientIds] = useState([]);
    const [constraints, setConstraints] = useState({ difficulty: "", prepTime: "", cookTime: "", servings: "" });
    const [subForm, setSubForm]         = useState({ ingredient: "", context: "", reason: "" });
    const [result, setResult]           = useState(null);
    const [aiLoading, setAiLoading]     = useState(false);
    const [aiError, setAiError]         = useState("");
    const [selectedSuggestion, setSelectedSuggestion]       = useState(null);
    const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);

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
                setHistoryError("Could not load AI history. Check your connection and try again.");
            } finally {
                setLoadingHistory(false);
            }
        }
        init();
    }, []);

    // Open the feature panel specified in the ?feature= query param (set by Sidebar buttons).
    useEffect(() => {
        const feature = searchParams.get("feature");
        if (!feature) return;
        if (!AI_FEATURES.some((f) => f.id === feature)) return;
        setActiveFeature(feature);
        setResult(null);
        setAiError("");
        setSelectedIngredientIds([]);
        setConstraints({ difficulty: "", prepTime: "", cookTime: "", servings: "" });
        setSubForm({ ingredient: "", context: "", reason: "" });
        window.requestAnimationFrame(() => {
            document.querySelector(".ai-active-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, [searchParams]);

    async function refreshHistory() {
        try {
            const data = await getAIHistory();
            setHistory(normalizeHistory(data));
        } catch {
            // non-critical — history display is secondary to the AI result
        }
    }

    // ── Feature panel helpers ──
    function openFeature(featureId) {
        setActiveFeature(featureId);
        setResult(null);
        setAiError("");
        setSelectedIngredientIds([]);
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
        setSelectedSuggestion(null);
    }

    function toggleIngredient(ingredient) {
        const id = ingredient.ingredientId;
        setSelectedIngredientIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    }

    // ── AI call handlers ──
    async function handleGenerateRecipe() {
        if (!selectedIngredientIds.length) return;
        setAiLoading(true);
        setAiError("");
        setResult(null);
        try {
            const ingredientNames = selectedIngredientIds
                .map((id) => allIngredients.find((i) => i.ingredientId === id)?.name)
                .filter(Boolean);
            const data = await generateRecipeFromPantry(ingredientNames, constraints);
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
            // silent — item will still show until next refresh
        }
    }

    // Open the matching feature panel and show the saved result from history.
    function handleHistoryClick(historyItem) {
        const featureId = REQUEST_TYPE_TO_FEATURE[historyItem.requestType];
        if (featureId) {
            setActiveFeature(featureId);
            setResult({ type: historyItem.requestType, data: historyItem.outputData, fromHistory: true });
            setAiError("");
            window.requestAnimationFrame(() => {
                document.querySelector(".ai-active-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    }

    const visibleHistory = useMemo(() => history, [history]);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="ai-assistant-page">
            <PageHero
                label="AI Assistant"
                title="Smart tools for smarter cooking"
                description="Generate recipes, get personalised suggestions, and find ingredient substitutes — powered by Google Gemini."
                stats={[
                    { value: AI_FEATURES.length, label: "AI tools" },
                    { value: visibleHistory.length, label: "Past requests" }
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

                            <MultiIngredientPicker
                                ingredients={allIngredients}
                                selectedIds={selectedIngredientIds}
                                onToggle={toggleIngredient}
                                onClearAll={() => setSelectedIngredientIds([])}
                                placeholder="Search and select ingredients..."
                            />

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
                                    disabled={!selectedIngredientIds.length || aiLoading}
                                    onClick={handleGenerateRecipe}
                                >
                                    {aiLoading
                                        ? "Generating..."
                                        : `Generate Recipe (${selectedIngredientIds.length} ingredient${selectedIngredientIds.length !== 1 ? "s" : ""})`}
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
                            {result.type === "suggestions" && (
                                <SuggestionCards
                                    suggestions={result.data}
                                    onSelect={(s, i) => { setSelectedSuggestion(s); setSelectedSuggestionIdx(i); }}
                                />
                            )}
                            {result.type === "ingredient_substitute" && <SubstituteDisplay substitutes={result.data} />}
                        </div>
                    )}
                </section>
            )}

            {/* ── AI Request History ── */}
            <FormCard
                label="History"
                title="AI Request History"
                description="Your previous recipe generations, suggestions, and ingredient substitutions."
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
                    <div className="ai-history-warning">
                        No AI requests yet. Use one of the tools above to create your first result.
                    </div>
                )}

                {!loadingHistory && visibleHistory.length > 0 && (
                    <div className="ai-history-list">
                        {visibleHistory.map((historyItem) => (
                            <div
                                key={historyItem.historyId}
                                className={[
                                    "ai-history-row",
                                    getHistoryColorClass(historyItem.requestType)
                                ].join(" ")}
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

            {selectedSuggestion && (
                <AISuggestionModal
                    suggestion={selectedSuggestion}
                    index={selectedSuggestionIdx}
                    onClose={() => setSelectedSuggestion(null)}
                />
            )}
        </div>
    );
}

export default AIAssistant;
