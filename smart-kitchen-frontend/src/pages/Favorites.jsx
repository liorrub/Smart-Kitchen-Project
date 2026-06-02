import "./Favorites.css";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageHero from "../components/PageHero";

const USERS_API_URL = "http://localhost:3000/api/users";
const RECIPES_API_URL = "http://localhost:3000/api/recipes";

function getStoredUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function getAuthHeaders() {
    const storedUser = getStoredUser();

    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole || storedUser?.role
    };
}

function getResponseData(response) {
    return response.data?.data || response.data || [];
}

function getErrorMessage(err, fallbackMessage) {
    const responseData = err.response?.data;

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof responseData?.error === "string") {
        return responseData.error;
    }

    if (typeof responseData?.error?.message === "string") {
        return responseData.error.message;
    }

    if (typeof err.message === "string") {
        return err.message;
    }

    return fallbackMessage;
}

function formatText(value) {
    if (!value) {
        return "Unknown";
    }

    return value
        .replace("-", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function formatDate(value) {
    if (!value) {
        return "Unknown date";
    }

    return new Date(value).toLocaleDateString("en-GB");
}

function getDifficultyClass(difficulty) {
    return `favorite-difficulty ${String(difficulty || "easy").toLowerCase()}`;
}

function getShortInstructions(instructions) {
    if (!instructions) {
        return "No instructions were added for this recipe yet.";
    }

    if (instructions.length <= 130) {
        return instructions;
    }

    return `${instructions.slice(0, 130)}...`;
}

function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [recipes, setRecipes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [removingRecipeId, setRemovingRecipeId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const storedUser = getStoredUser();

    useEffect(() => {
        loadPageData();
    }, []);

    async function loadPageData() {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            if (!storedUser?.userId) {
                setError("User was not found. Please login again.");
                return;
            }

            const [favoritesResponse, recipesResponse] = await Promise.all([
                axios.get(
                    `${USERS_API_URL}/${storedUser.userId}/favorites`,
                    {
                        headers: getAuthHeaders(),
                        params: {
                            _t: Date.now()
                        }
                    }
                ),
                axios.get(
                    RECIPES_API_URL,
                    {
                        headers: getAuthHeaders(),
                        params: {
                            _t: Date.now()
                        }
                    }
                )
            ]);

            setFavorites(getResponseData(favoritesResponse));
            setRecipes(getResponseData(recipesResponse));
        } catch (err) {
            console.error("Favorites loading error:", err);
            console.error("Server response:", err.response?.data);

            setError(
                getErrorMessage(
                    err,
                    "Failed to load favorites."
                )
            );
        } finally {
            setLoading(false);
        }
    }

    const favoriteRecipes = useMemo(() => {
        return favorites
            .map((favorite) => {
                const recipe = recipes.find(
                    (currentRecipe) =>
                        currentRecipe.recipeId === favorite.recipeId
                );

                return {
                    ...favorite,
                    recipe
                };
            })
            .filter((favorite) => favorite.recipe);
    }, [favorites, recipes]);

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

    async function removeFavorite(recipeId) {
        try {
            setRemovingRecipeId(recipeId);
            setError("");
            setSuccess("");

            await axios.delete(
                `${USERS_API_URL}/${storedUser.userId}/favorites/${recipeId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            setFavorites((previousFavorites) =>
                previousFavorites.filter(
                    (favorite) => favorite.recipeId !== recipeId
                )
            );

            setSuccess("Recipe removed from favorites.");
        } catch (err) {
            console.error("Remove favorite error:", err);
            console.error("Server response:", err.response?.data);

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
                    <p>Please wait while we prepare your saved recipes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            {success && (
                <div className="favorites-toast">
                    <strong>Success</strong>

                    <p>{success}</p>

                    <button
                        type="button"
                        onClick={() => setSuccess("")}
                    >
                        ×
                    </button>
                </div>
            )}

            <PageHero
                label="Favorites"
                title="Your saved recipe collection"
                description="Keep the meals you love in one place and return to them whenever you need cooking inspiration."
                stats={[
                    {
                        value: favoriteRecipes.length,
                        label: "Saved Recipes"
                    },
                    {
                        value: averageTime,
                        label: "Avg. Minutes"
                    },
                    {
                        value: cuisineCount,
                        label: "Cuisines"
                    },
                    {
                        value: quickRecipesCount,
                        label: "Quick Meals"
                    }
                ]}
            />

            {error && (
                <div className="favorites-alert error">
                    {error}
                </div>
            )}

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
                        {favoriteRecipes.map((favorite) => {
                            const recipe = favorite.recipe;

                            return (
                                <article
                                    key={favorite.favoriteId}
                                    className="favorite-recipe-card"
                                >
                                    <div className="favorite-recipe-card-header">
                                        <div>
                                            <p className="favorite-category">
                                                {formatText(recipe.category)}
                                            </p>

                                            <h3>{recipe.title}</h3>
                                        </div>

                                        <span
                                            className={getDifficultyClass(
                                                recipe.difficulty
                                            )}
                                        >
                                            {formatText(recipe.difficulty)}
                                        </span>
                                    </div>

                                    <p className="favorite-instructions">
                                        {getShortInstructions(
                                            recipe.instructions
                                        )}
                                    </p>

                                    <div className="favorite-info-grid">
                                        <div>
                                            <span>Cuisine</span>
                                            <strong>
                                                {formatText(recipe.cuisine)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Time</span>
                                            <strong>
                                                {recipe.totalTime || 0} min
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Servings</span>
                                            <strong>
                                                {recipe.servings || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Calories</span>
                                            <strong>
                                                {recipe.calories || "-"}
                                            </strong>
                                        </div>
                                    </div>

                                    {Array.isArray(recipe.tags) &&
                                        recipe.tags.length > 0 && (
                                            <div className="favorite-tags">
                                                {recipe.tags.map((tag) => (
                                                    <span key={tag}>
                                                        #{formatText(tag)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                    {Array.isArray(recipe.allergens) &&
                                        recipe.allergens.length > 0 && (
                                            <div className="favorite-allergens">
                                                <span>Allergens</span>

                                                <p>
                                                    {recipe.allergens
                                                        .map(formatText)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                        )}

                                    <div className="favorite-card-footer">
                                        <span>
                                            Saved on{" "}
                                            {formatDate(favorite.createdAt)}
                                        </span>

                                        <button
                                            type="button"
                                            className="remove-favorite-button"
                                            onClick={() =>
                                                removeFavorite(recipe.recipeId)
                                            }
                                            disabled={
                                                removingRecipeId ===
                                                recipe.recipeId
                                            }
                                        >
                                            {removingRecipeId === recipe.recipeId
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Favorites;
