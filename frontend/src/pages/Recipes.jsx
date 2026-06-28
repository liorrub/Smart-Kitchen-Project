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
import {
    getUserLikedRecipeIds,
    likeRecipe,
    unlikeRecipe
} from "../services/likeService";
import { getResponseData, getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";
import { applySort } from "../utils/recipeSortUtils";

const RECIPES_API_URL = `${API_BASE_URL}/recipes`;

const DEFAULT_FILTER_VALUE = "all";
const PAGE_SIZE = 8;

const SORT_OPTIONS = [
    { value: "default",         label: "Recommended" },
    { value: "newest",          label: "Newest first" },
    { value: "oldest",          label: "Oldest first" },
    { value: "prep-asc",        label: "Prep time: shortest first" },
    { value: "prep-desc",       label: "Prep time: longest first" },
    { value: "servings-asc",    label: "Servings: lowest first" },
    { value: "servings-desc",   label: "Servings: highest first" },
    { value: "difficulty-asc",  label: "Difficulty: easiest first" },
    { value: "difficulty-desc", label: "Difficulty: hardest first" },
    { value: "likes-desc",      label: "Most liked" },
];

// Build a filter dropdown options list from a list of values, with an "all" option prepended.
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
    const [likedRecipeIds, setLikedRecipeIds] = useState(new Set());
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(DEFAULT_FILTER_VALUE);
    const [cuisineFilter, setCuisineFilter] = useState(DEFAULT_FILTER_VALUE);
    const [difficultyFilter, setDifficultyFilter] = useState(DEFAULT_FILTER_VALUE);
    const [sortBy, setSortBy] = useState("default");

    const [loading, setLoading] = useState(true);
    const [favoriteLoadingRecipeId, setFavoriteLoadingRecipeId] = useState(null);
    const [likeLoadingRecipeId, setLikeLoadingRecipeId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const storedUser = getStoredUser();

    // Load all recipes and the user's favorites in parallel when the page opens.
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

                const [recipesResponse, favoritesData, likedIds] = await Promise.all([
                    recipesRequest,
                    getUserFavorites(storedUser.userId),
                    getUserLikedRecipeIds(storedUser.userId)
                ]);

                setRecipes(getResponseData(recipesResponse));
                setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
                setLikedRecipeIds(new Set(Array.isArray(likedIds) ? likedIds : []));
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

    // Reset to page 1 when any filter or sort option changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, cuisineFilter, difficultyFilter, sortBy]);

    // Build a fast Set of recipe IDs the user has already saved as favorites.
    const favoriteRecipeIds = useMemo(() => {
        return new Set(
            favorites.map((favorite) => favorite.recipeId)
        );
    }, [favorites]);

    // Derive filter dropdown options from unique values in the current recipe list.
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

    // Filter the recipe list by search term, category, cuisine, and difficulty,
    // then sort the filtered copy according to the selected sort option.
    const visibleRecipes = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        const filtered = recipes.filter((recipe) => {
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

        return applySort(filtered, sortBy);
    }, [
        recipes,
        searchTerm,
        categoryFilter,
        cuisineFilter,
        difficultyFilter,
        sortBy
    ]);

    const quickRecipesCount = recipes.filter(
        (recipe) => Number(recipe.totalTime) <= 30
    ).length;

    const totalPages = Math.max(1, Math.ceil(visibleRecipes.length / PAGE_SIZE));
    const paginatedRecipes = useMemo(
        () => visibleRecipes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [visibleRecipes, currentPage]
    );

    // Reset all active filters, the search term, and the sort back to their default values.
    function clearFilters() {
        setSearchTerm("");
        setCategoryFilter(DEFAULT_FILTER_VALUE);
        setCuisineFilter(DEFAULT_FILTER_VALUE);
        setDifficultyFilter(DEFAULT_FILTER_VALUE);
        setSortBy("default");
    }

    // Toggle a recipe as favorite: add it if not saved, remove it if already saved.
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

    // Toggle like on a recipe: optimistic update, revert on error.
    async function handleLikeClick(recipe) {
        if (!storedUser?.userId) {
            setError("Please login to like recipes.");
            return;
        }

        const isAlreadyLiked = likedRecipeIds.has(recipe.recipeId);

        // Optimistic update
        setLikeLoadingRecipeId(recipe.recipeId);
        setError("");
        setSuccess("");

        const delta = isAlreadyLiked ? -1 : 1;

        setRecipes(prev => prev.map(r =>
            r.recipeId === recipe.recipeId
                ? { ...r, likeCount: Math.max(0, (r.likeCount || 0) + delta) }
                : r
        ));

        setLikedRecipeIds(prev => {
            const next = new Set(prev);
            isAlreadyLiked ? next.delete(recipe.recipeId) : next.add(recipe.recipeId);
            return next;
        });

        // Sync selectedRecipe if the modal is open for the same recipe
        setSelectedRecipe(prev =>
            prev?.recipeId === recipe.recipeId
                ? { ...prev, likeCount: Math.max(0, (prev.likeCount || 0) + delta) }
                : prev
        );

        try {
            if (isAlreadyLiked) {
                await unlikeRecipe(recipe.recipeId);
            } else {
                await likeRecipe(recipe.recipeId);
            }
        } catch (err) {
            // Revert optimistic update on error
            setRecipes(prev => prev.map(r =>
                r.recipeId === recipe.recipeId
                    ? { ...r, likeCount: Math.max(0, (r.likeCount || 0) - delta) }
                    : r
            ));
            setLikedRecipeIds(prev => {
                const next = new Set(prev);
                isAlreadyLiked ? next.add(recipe.recipeId) : next.delete(recipe.recipeId);
                return next;
            });
            setError(getErrorMessage(err, "Failed to update like."));
        } finally {
            setLikeLoadingRecipeId(null);
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
                isLiked={selectedRecipe ? likedRecipeIds.has(selectedRecipe.recipeId) : false}
                onLikeClick={handleLikeClick}
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

                    <CustomSelect
                        label="Sort by"
                        name="sort"
                        value={sortBy}
                        options={SORT_OPTIONS}
                        onChange={(event) =>
                            setSortBy(event.target.value)
                        }
                        wrapperClassName="recipes-sort-select"
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
                    {paginatedRecipes.map((recipe) => {
                        const isFavorite = favoriteRecipeIds.has(recipe.recipeId);
                        const isLiked = likedRecipeIds.has(recipe.recipeId);

                        return (
                            <RecipeCard
                                key={recipe.recipeId}
                                recipe={recipe}
                                onClick={setSelectedRecipe}
                                showFavoriteButton
                                isFavorite={isFavorite}
                                onFavoriteClick={handleFavoriteClick}
                                favoriteLoading={favoriteLoadingRecipeId === recipe.recipeId}
                                favoriteLoadingText={isFavorite ? "Removing..." : "Saving..."}
                                showLikeButton
                                isLiked={isLiked}
                                likeCount={recipe.likeCount || 0}
                                onLikeClick={handleLikeClick}
                                likeLoading={likeLoadingRecipeId === recipe.recipeId}
                            />
                        );
                    })}
                </section>
            )}

            {totalPages > 1 && (
                <div className="recipes-pagination">
                    <button
                        type="button"
                        className="recipes-pagination-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        ← Previous
                    </button>
                    <span className="recipes-pagination-info">Page {currentPage} of {totalPages}</span>
                    <button
                        type="button"
                        className="recipes-pagination-btn"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

export default Recipes;
