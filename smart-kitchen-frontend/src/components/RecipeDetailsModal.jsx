import "./RecipeDetailsModal.css";

function formatText(value) {
    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replace("-", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function getCategoryClass(category) {
    const validCategories = [
        "breakfast",
        "lunch",
        "dinner",
        "snack"
    ];

    return validCategories.includes(category)
        ? `recipe-modal-${category}`
        : "recipe-modal-default";
}

/*
    Converts recipe instructions into ordered steps.
    Supports instructions written as:
    "Boil water, cook pasta, add sauce."
*/
function getInstructionSteps(instructions) {
    if (!instructions) {
        return [];
    }

    if (Array.isArray(instructions)) {
        return instructions.filter(Boolean);
    }

    return String(instructions)
        .replace(/\.$/, "")
        .split(/,\s*|\.\s+/)
        .map((step) => step.trim())
        .filter(Boolean);
}

/*
    Modal for displaying the full selected recipe.
    Receives the selected recipe using props.
*/
function RecipeDetailsModal({ recipe, onClose }) {
    if (!recipe) {
        return null;
    }

    const categoryClass = getCategoryClass(recipe.category);
    const instructionSteps = getInstructionSteps(recipe.instructions);

    return (
        <div
            className="recipe-modal-overlay"
            onClick={onClose}
        >
            <div
                className={`recipe-modal ${categoryClass}`}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="recipe-modal-close"
                    onClick={onClose}
                    aria-label="Close recipe details"
                >
                    ×
                </button>

                {/* Header */}
                <header className="recipe-modal-header">
                    <p className="recipe-modal-label">
                        {formatText(recipe.category)}
                    </p>

                    <h2>{recipe.title}</h2>

                    <p className="recipe-modal-subtitle">
                        {formatText(recipe.cuisine)} cuisine ·{" "}
                        {formatText(recipe.difficulty)}
                    </p>
                </header>

                {/* Quick stats */}
                <section className="recipe-modal-stats">
                    <div className="recipe-modal-stat">
                        <strong>{recipe.prepTime || 0}</strong>
                        <span>Prep min</span>
                    </div>

                    <div className="recipe-modal-stat">
                        <strong>{recipe.cookTime || 0}</strong>
                        <span>Cook min</span>
                    </div>

                    <div className="recipe-modal-stat">
                        <strong>{recipe.totalTime || 0}</strong>
                        <span>Total min</span>
                    </div>

                    <div className="recipe-modal-stat">
                        <strong>{recipe.servings || 1}</strong>
                        <span>Servings</span>
                    </div>

                    <div className="recipe-modal-stat">
                        <strong>{recipe.calories || 0}</strong>
                        <span>Calories</span>
                    </div>
                </section>

                {/* Instructions */}
                <section className="recipe-modal-section">
                    <div className="recipe-modal-section-title">
                        <span>👩‍🍳</span>
                        <h3>Instructions</h3>
                    </div>

                    {instructionSteps.length > 0 ? (
                        <ol className="recipe-instructions-list">
                            {instructionSteps.map((step, index) => (
                                <li key={`${step}-${index}`}>
                                    <span className="instruction-number">
                                        {index + 1}
                                    </span>

                                    <p>{step}</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        <p className="recipe-modal-empty-text">
                            No instructions were added for this recipe.
                        </p>
                    )}
                </section>

                {/* Tags */}
                {(recipe.tags || []).length > 0 && (
                    <section className="recipe-modal-section">
                        <div className="recipe-modal-section-title">
                            <span>🏷️</span>
                            <h3>Tags</h3>
                        </div>

                        <div className="recipe-modal-tags">
                            {recipe.tags.map((tag) => (
                                <span key={tag}>
                                    #{formatText(tag)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Allergens */}
                {(recipe.allergens || []).length > 0 && (
                    <section className="recipe-modal-section">
                        <div className="recipe-modal-section-title">
                            <span>⚠️</span>
                            <h3>Allergens</h3>
                        </div>

                        <div className="recipe-modal-allergens">
                            {recipe.allergens.map((allergen) => (
                                <span key={allergen}>
                                    {formatText(allergen)}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default RecipeDetailsModal;