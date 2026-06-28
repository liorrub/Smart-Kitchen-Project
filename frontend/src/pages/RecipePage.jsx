import "./RecipePage.css";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import RecipeDetailsModal from "../components/RecipeDetailsModal";
import ShareRecipeButton from "../components/ShareRecipeButton";
import { getRecipeById } from "../services/recipeService";
import { getUserLikedRecipeIds, likeRecipe, unlikeRecipe } from "../services/likeService";
import { useAuth } from "../context/AuthContext";

// Stable public recipe page accessible at /recipes/:id.
// Reuses RecipeDetailsModal content in a full-page wrapper (no overlay).
// This URL is what ShareRecipeButton copies — any logged-in user can open it directly.
function RecipePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const data = await getRecipeById(id);
                setRecipe(data);

                if (currentUser?.userId) {
                    try {
                        const liked = await getUserLikedRecipeIds(currentUser.userId);
                        setIsLiked(Array.isArray(liked) && liked.includes(data.recipeId));
                    } catch {
                        // Like state is non-critical — swallow error
                    }
                }
            } catch (err) {
                setError(
                    err?.response?.status === 404
                        ? "This recipe is no longer available."
                        : "Failed to load recipe."
                );
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, currentUser?.userId]);

    async function handleLikeClick() {
        if (!recipe) return;
        try {
            if (isLiked) {
                await unlikeRecipe(recipe.recipeId);
                setIsLiked(false);
            } else {
                await likeRecipe(recipe.recipeId);
                setIsLiked(true);
            }
        } catch {
            // Silently ignore — same pattern as Recipes page
        }
    }

    if (loading) {
        return (
            <div className="recipe-page">
                <p className="recipe-page-loading">Loading recipe...</p>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="recipe-page">
                <div className="recipe-page-error">
                    <p>{error || "Recipe not found."}</p>
                    <button
                        type="button"
                        className="recipe-page-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recipe-page">
            <div className="recipe-page-nav">
                <button
                    type="button"
                    className="recipe-page-back-btn"
                    onClick={() => navigate("/recipes")}
                >
                    ← Back to Recipes
                </button>

                <div className="recipe-page-nav-actions">
                    <ShareRecipeButton recipe={recipe} />

                    <Link
                        to={`/recipes/${recipe.recipeId}/discussion`}
                        className="recipe-page-discussion-link"
                    >
                        💬 Open Discussion
                    </Link>
                </div>
            </div>

            {/* Render RecipeDetailsModal content as a full-page element (no overlay) */}
            <div className="recipe-page-modal-wrapper">
                <RecipeDetailsModal
                    recipe={recipe}
                    onClose={() => navigate("/recipes")}
                    isLiked={isLiked}
                    onLikeClick={handleLikeClick}
                />
            </div>
        </div>
    );
}

export default RecipePage;
