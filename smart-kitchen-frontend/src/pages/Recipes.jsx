import "./Recipes.css";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import CustomSelect from "../components/CustomSelect";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";

import {
    addFavorite,
    getUserFavorites,
    removeFavorite
} from "../services/favoritesService";
import { getResponseData, getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";

const RECIPES_API_URL = `${API_BASE_URL}/recipes`;

const DEFAULT_FILTER_VALUE = "all";

function createFilterOptions(values, allLabel) {
    const uniqueValues = [...new Set(values.filter(Boolean))];

    return [
        {
            value: DEFAULT_FILTER_VALUE,
            label: allLabel
        },
        ...uniqueValues.map((value) => ({
            value,
            label: value
        }))
    ];
}

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTER_VALUE);
    const [cuisineFilter, setCuisineFilter] = useState(DEFAULT_FILTER_VALUE);
    const [difficultyFilter, setDifficultyFilter] = useState(DEFAULT_FILTER_VALUE);

    const [loading, setLoading] = useState(true);
    const [favoriteLoadingRecipeId, setFavoriteLoadingRecipeId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const storedUser = getStoredUser();

    useEffect(() => {
        async function loadRecipesPage() {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                const recipesRequest = axios.get(RECIPES_API_URL);

                if (!storedUser?.userId) {
                    const recipesResponse = await recipesRequest;

                    setRecipes(getResponseData(recipesResponse));
                    setFavorites([]);

                    return;
                }

                const [recipesResponse, favoritesData] = await Promise.all([
                    recipesRequest,
                    getUserFavorites(storedUser.userId)
                ]);

                setRecipes(getResponseData(recipesResponse));
                setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
            } catch (err) {
                console.error("Recipes page loading error:", err);

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load recipes."
                    )
                );
            } finally {
                setLoading(false);
            }
        }

        loadRecipesPage();
    }, [storedUser?.userId]);

    const favoriteRecipeIds = useMemo(() => {
        return new Set(
            favorites.map((favorite) => favorite.recipeId)
        );
    }, [favorites]);

    const categoryOptions = useMemo(() => {
        return createFilterOptions(
            recipes.map((recipe) => recipe.category),
            "All categories"
        );
    }, [recipes]);

    const cuisineOptions = useMemo(() => {
        return createFilterOptions(
            recipes.map((recipe) => recipe.cuisine),
            "All cuisines"
        );
    }, [recipes]);

    const difficultyOptions = useMemo(() => {
        return createFilterOptions(
            recipes.map((recipe) => recipe.difficulty),
            "All difficulties"
        );
    }, [recipes]);

    const visibleRecipes = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        return recipes.filter((recipe) => {
            const title = String(recipe.title || "").toLowerCase();
            const instructions = String(recipe.instructions || "").toLowerCase();
            const tags = recipe.tags || [];

            const matchesSearch =
                !normalizedSearchTerm ||
                title.includes(normalizedSearchTerm) ||
                instructions.includes(normalizedSearchTerm) ||
                tags.some((tag) =>
                    String(tag).toLowerCase().includes(normalizedSearchTerm)
                );

            const matchesCategory =
                categoryFilter === DEFAULT_FILTER_VALUE ||
                recipe.category === categoryFilter;

            const matchesCuisine =
                cuisineFilter === DEFAULT_FILTER_VALUE ||
                recipe.cuisine === cuisineFilter;

            const matchesDifficulty =
                difficultyFilter === DEFAULT_FILTER_VALUE ||
                recipe.difficulty === difficultyFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesCuisine &&
                matchesDifficulty
            );
        });
    }, [
        recipes,
        searchTerm,
        categoryFilter,
        cuisineFilter,
        difficultyFilter
    ]);

    const quickRecipesCount = recipes.filter(
        (recipe) => Number(recipe.totalTime) <= 30
    ).length;

    function clearFilters() {
        setSearchTerm("");
        setCategoryFilter(DEFAULT_FILTER_VALUE);
        setCuisineFilter(DEFAULT_FILTER_VALUE);
        setDifficultyFilter(DEFAULT_FILTER_VALUE);
    }

    async function handleFavoriteClick(recipe) {
        if (!storedUser?.userId) {
            setError("Please login before adding recipes to favorites.");
            return;
        }

        const isAlreadyFavorite = favoriteRecipeIds.has(recipe.recipeId);

        try {
            setFavoriteLoadingRecipeId(recipe.recipeId);
            setError("");
            setSuccess("");

            if (isAlreadyFavorite) {
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
            } else {
                const favorite = await addFavorite(
                    storedUser.userId,
                    recipe.recipeId
                );

                setFavorites((previousFavorites) => [
                    ...previousFavorites,
                    favorite
                ]);

                setSuccess("Recipe added to favorites.");
            }
        } catch (err) {
            console.error("Favorite update error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to update favorites."
                )
            );
        } finally {
            setFavoriteLoadingRecipeId(null);
        }
    }

    if (loading) {
        return (
            <div className="recipes-page">
                <div className="recipes-message-card">
                    <h1>Loading recipes...</h1>

                    <p>
                        Please wait while we prepare the recipe collection.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="recipes-page">
            <MessageModal
                type="success"
                title="Success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
                title="Recipes Error"
                message={error}
                onClose={() => setError("")}
            />

            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />

            <PageHero
                label="Recipe Collection"
                title="Discover meals for every craving"
                description="Browse recipes, filter by cooking style, and save your favorite meals."
                stats={[
                    {
                        value: recipes.length,
                        label: "Total recipes"
                    },
                    {
                        value: visibleRecipes.length,
                        label: "Shown now"
                    },
                    {
                        value: favorites.length,
                        label: "Favorites"
                    },
                    {
                        value: quickRecipesCount,
                        label: "Quick meals"
                    }
                ]}
            />

            <section className="recipes-card">
                <div className="recipes-card-header">
                    <div>
                        <h2>Find a recipe</h2>

                        <p>
                            Search, filter and save recipes to your favorites.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="recipes-clear-button"
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                </div>

                <div className="recipes-filters-grid">
                    <FormField
                        label="Search"
                        type="text"
                        name="search"
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(event.target.value)
                        }
                        placeholder="Search by name, tag or instruction"
                    />

                    <CustomSelect
                        label="Category"
                        name="category"
                        value={categoryFilter}
                        options={categoryOptions}
                        onChange={(event) =>
                            setCategoryFilter(event.target.value)
                        }
                    />

                    <CustomSelect
                        label="Cuisine"
                        name="cuisine"
                        value={cuisineFilter}
                        options={cuisineOptions}
                        onChange={(event) =>
                            setCuisineFilter(event.target.value)
                        }
                    />

                    <CustomSelect
                        label="Difficulty"
                        name="difficulty"
                        value={difficultyFilter}
                        options={difficultyOptions}
                        onChange={(event) =>
                            setDifficultyFilter(event.target.value)
                        }
                    />
                </div>
            </section>

            {visibleRecipes.length === 0 ? (
                <section className="recipes-empty-state">
                    <div className="recipes-empty-icon">
                        🍽️
                    </div>

                    <h3>No recipes found</h3>

                    <p>
                        Try changing the search text or clearing the filters.
                    </p>
                </section>
            ) : (
                <section className="recipes-grid">
                    {visibleRecipes.map((recipe) => {
                        const isFavorite =
                            favoriteRecipeIds.has(recipe.recipeId);

                        return (
                            <RecipeCard
                                key={recipe.recipeId}
                                recipe={recipe}
                                onClick={setSelectedRecipe}
                                showFavoriteButton
                                isFavorite={isFavorite}
                                onFavoriteClick={handleFavoriteClick}
                                favoriteLoading={
                                    favoriteLoadingRecipeId === recipe.recipeId
                                }
                                favoriteLoadingText={
                                    isFavorite ? "Removing..." : "Saving..."
                                }
                            />
                        );
                    })}
                </section>
            )}
        </div>
    );
}

export default Recipes;
