import "./Favorites.css";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import PageErrorState from "../components/PageErrorState";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";

import {
    getUserFavorites,
    removeFavorite
} from "../services/favoritesService";
import { getResponseData, getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

const RECIPES_API_URL = `${API_BASE_URL}/recipes`;

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const [loading, setLoading] = useState(true);
    const [removingRecipeId, setRemovingRecipeId] = useState(null);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [success, setSuccess] = useState("");
    const [confirmRemove, setConfirmRemove] = useState(null);

    const storedUser = getStoredUser();

    // Load the user's favorites and the full recipe catalog in parallel on page open.
    useEffect(() => {
        async function loadFavoritesPage() {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                if (!storedUser?.userId) {
                    setError("User was not found. Please login again.");
                    return;
                }

                const [favoritesData, recipesResponse] = await Promise.all([
                    getUserFavorites(storedUser.userId),
                    axios.get(RECIPES_API_URL)
                ]);

                setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
                setRecipes(getResponseData(recipesResponse));
            } catch (err) {
                console.error("Favorites loading error:", err);

                setLoadError(
                    !err.response
                        ? "Unable to connect to the server. Please try again in a few moments."
                        : getErrorMessage(err, "Failed to load favorites.")
                );
            } finally {
                setLoading(false);
            }
        }

        loadFavoritesPage();
    }, [storedUser?.userId]);

    // Join favorite entries with their full recipe data from the recipes list.
    const favoriteRecipes = useMemo(() => {
        return favorites
            .map((favorite) => {
                const recipe = recipes.find(
                    (currentRecipe) =>
                        currentRecipe.recipeId === favorite.recipeId
                );

                return recipe
                    ? {
                        ...favorite,
                        recipe
                    }
                    : null;
            })
            .filter(Boolean);
    }, [favorites, recipes]);

    // Calculate the average cook time in minutes across all favorite recipes.
    const averageTime = useMemo(() => {
        if (favoriteRecipes.length === 0) {
            return 0;
        }

        const totalMinutes = favoriteRecipes.reduce(
            (sum, favorite) =>
                sum + Number(favorite.recipe.totalTime || 0),
            0
        );

        return Math.round(totalMinutes / favoriteRecipes.length);
    }, [favoriteRecipes]);

    // Count how many distinct cuisines are represented in the user's favorites.
    const cuisineCount = useMemo(() => {
        const cuisines = new Set(
            favoriteRecipes.map(
                (favorite) => favorite.recipe.cuisine
            )
        );

        return cuisines.size;
    }, [favoriteRecipes]);

    const quickRecipesCount = favoriteRecipes.filter(
        (favorite) => Number(favorite.recipe.totalTime || 0) <= 30
    ).length;

    function handleRemoveClick(recipe) {
        setConfirmRemove(recipe);
    }

    async function handleConfirmRemove() {
        const recipe = confirmRemove;
        setConfirmRemove(null);
        await handleRemoveFavorite(recipe);
    }

    // Remove a recipe from favorites and update the local list on success.
    async function handleRemoveFavorite(recipe) {
        if (!storedUser?.userId) {
            setError("User was not found. Please login again.");
            return;
        }

        try {
            setRemovingRecipeId(recipe.recipeId);
            setError("");
            setSuccess("");

            await removeFavorite(
                storedUser.userId,
                recipe.recipeId
            );

            setFavorites((previousFavorites) =>
                previousFavorites.filter(
                    (favorite) => favorite.recipeId !== recipe.recipeId
                )
            );

            setSuccess("Recipe removed from favorites.");
        } catch (err) {
            console.error("Remove favorite error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to remove favorite."
                )
            );
        } finally {
            setRemovingRecipeId(null);
        }
    }

    if (loading) {
        return (
            <div className="favorites-page">
                <div className="favorites-message-card">
                    <h1>Loading favorites...</h1>

                    <p>
                        Please wait while we prepare your saved recipes.
                    </p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="favorites-page">
                <PageErrorState
                    title="Favorites Error"
                    message={loadError}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <MessageModal
                type="success"
                title="Success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
                title="Favorites Error"
                message={error}
                onClose={() => setError("")}
            />

            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />

            <PageHero
                label="Favorites"
                title="Your saved recipe collection"
                description="Keep the meals you love in one place and open them whenever you need cooking inspiration."
                stats={[
                    {
                        value: favoriteRecipes.length,
                        label: "Saved recipes"
                    },
                    {
                        value: averageTime,
                        label: "Avg. minutes"
                    },
                    {
                        value: cuisineCount,
                        label: "Cuisines"
                    },
                    {
                        value: quickRecipesCount,
                        label: "Quick meals"
                    }
                ]}
            />

            <section className="favorites-card">
                <div className="favorites-card-header">
                    <div>
                        <p className="favorites-section-label">
                            Saved meals
                        </p>

                        <h2>Favorite Recipes</h2>

                        <span>
                            Recipes you marked as favorites are shown here.
                        </span>
                    </div>
                </div>

                {favoriteRecipes.length === 0 ? (
                    <div className="favorites-empty-state">
                        <div className="favorites-empty-icon">
                            ♡
                        </div>

                        <h3>No favorites yet</h3>

                        <p>
                            Add recipes to favorites from the recipes page, and
                            they will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="favorites-grid">
                        {favoriteRecipes.map((favorite) => (
                            <RecipeCard
                                key={favorite.favoriteId}
                                recipe={favorite.recipe}
                                onClick={setSelectedRecipe}
                                showFavoriteButton
                                isFavorite
                                onFavoriteClick={handleRemoveClick}
                                favoriteLoading={
                                    removingRecipeId === favorite.recipe.recipeId
                                }
                                favoriteButtonText="Remove"
                                favoriteLoadingText="Removing..."
                            />
                        ))}
                    </div>
                )}
            </section>

            {confirmRemove && (
                <ConfirmDeleteModal
                    label="Remove from favorites"
                    description={`Remove "${confirmRemove.title}" from your favorites?`}
                    confirmText="Yes, remove"
                    onConfirm={handleConfirmRemove}
                    onCancel={() => setConfirmRemove(null)}
                />
            )}
        </div>
    );
}

export default Favorites;
