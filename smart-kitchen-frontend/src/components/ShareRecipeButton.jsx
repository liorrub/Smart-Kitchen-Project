import "./ShareRecipeButton.css";

import { useState } from "react";
import { shareRecipe } from "../utils/shareUtils";

// Reusable Share button for recipes.
// Uses the Web Share API when available; falls back to clipboard.
// compact=true renders a smaller button for RecipeCard use.
function ShareRecipeButton({ recipe, compact = false, onClick }) {
    const [status, setStatus] = useState(null); // null | 'copied' | 'error'

    async function handleShare(e) {
        // Allow callers to intercept (e.g. RecipeCard stopPropagation)
        onClick?.(e);

        const result = await shareRecipe(recipe);

        if (result === "copied") {
            setStatus("copied");
            setTimeout(() => setStatus(null), 2500);
        } else if (result === "error") {
            setStatus("error");
            setTimeout(() => setStatus(null), 3000);
        }
        // 'shared' and 'cancelled' need no feedback state change
    }

    const btnClass = `share-recipe-btn${compact ? " share-recipe-btn-compact" : ""}`;

    return (
        <button
            type="button"
            className={btnClass}
            onClick={handleShare}
            aria-label={`Share recipe: ${recipe?.title || "recipe"}`}
        >
            🔗 {compact ? "" : "Share"}
            {status === "copied" && (
                <span className="share-status-msg">Recipe link copied!</span>
            )}
            {status === "error" && (
                <span className="share-status-msg share-status-error">Could not copy link</span>
            )}
        </button>
    );
}

export default ShareRecipeButton;
