import "./RecipeDetailsModal.css";

import { useEffect, useMemo, useState } from "react";

import ReviewCard from "./ReviewCard";

import { getRecipeReviews } from "../services/reviewsService";

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

function getInstructionSteps(instructions) {
    if (!instructions) {
        return [];
    }

    if (Array.isArray(instructions)) {
        return instructions.filter(Boolean);
    }

    return String(instructions)
        .replace(/\.$/, "")
        .split(/\.\s+|,\s*/)
        .map((step) => step.trim())
        .filter(Boolean);
}

function getRecipeIngredients(recipe) {
    if (!recipe) {
        return [];
    }

    if (Array.isArray(recipe.ingredients)) {
        return recipe.ingredients;
    }

    if (Array.isArray(recipe.recipeIngredients)) {
        return recipe.recipeIngredients;
    }

    return [];
}

function getIngredientName(ingredient) {
    return (
        ingredient.name ||
        ingredient.ingredientName ||
        ingredient.title ||
        `Ingredient #${ingredient.ingredientId || ingredient.id || ""}`
    );
}

function getIngredientQuantity(ingredient) {
    return (
        ingredient.quantity ||
        ingredient.amount ||
        ingredient.qty ||
        ""
    );
}

function getIngredientUnit(ingredient) {
    return (
        ingredient.unit ||
        ingredient.measurementUnit ||
        ""
    );
}

function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

function getErrorMessage(error, fallbackMessage) {
    const responseData = error.response?.data;

    if (typeof responseData?.error?.message === "string") {
        return responseData.error.message;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
}

function getAverageRating(reviews) {
    if (!reviews.length) {
        return 0;
    }

    const totalRating = reviews.reduce(
        (sum, review) => sum + Number(review.rating || 0),
        0
    );

    return (totalRating / reviews.length).toFixed(1);
}

function renderRatingStars(rating) {
    const roundedRating = Math.round(Number(rating) || 0);

    return "★".repeat(roundedRating) + "☆".repeat(5 - roundedRating);
}

/*
    Recipe details modal.
    Keeps the title style aligned with the rest of Smart Kitchen,
    while using a cleaner recipe-page layout for ingredients and instructions.
*/
function RecipeDetailsModal({ recipe, onClose }) {
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState("");

    const currentUser = getStoredUser();

    useEffect(() => {
        async function loadReviews() {
            if (!recipe?.recipeId) {
                setReviews([]);
                return;
            }

            try {
                setReviewsLoading(true);
                setReviewsError("");

                const data = await getRecipeReviews(recipe.recipeId);

                setReviews(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Reviews loading error:", error);

                setReviewsError(
                    getErrorMessage(
                        error,
                        "Failed to load recipe reviews."
                    )
                );
            } finally {
                setReviewsLoading(false);
            }
        }

        loadReviews();
    }, [recipe?.recipeId]);

    useEffect(() => {
        if (recipe) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [recipe]);

    const otherUsersReviews = useMemo(() => {
        return reviews.filter(
            (review) => review.userId !== currentUser?.userId
        );
    }, [reviews, currentUser?.userId]);

    if (!recipe) {
        return null;
    }

    const categoryClass = getCategoryClass(recipe.category);
    const instructionSteps = getInstructionSteps(recipe.instructions);
    const ingredients = getRecipeIngredients(recipe);
    const averageRating = getAverageRating(otherUsersReviews);
    const influencerReviewsCount = otherUsersReviews.filter(
        (review) => review.isInfluencer
    ).length;

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

                <div className="recipe-modal-body">
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

                <section className="recipe-main-grid">
                    <article className="recipe-detail-card recipe-ingredients-card">
                        <div className="recipe-card-title">
                            <span>🥕</span>
                            <h3>Ingredients</h3>
                        </div>

                        {ingredients.length > 0 ? (
                            <ul className="recipe-simple-ingredients">
                                {ingredients.map((ingredient, index) => {
                                    const ingredientName =
                                        getIngredientName(ingredient);
                                    const quantity =
                                        getIngredientQuantity(ingredient);
                                    const unit = getIngredientUnit(ingredient);

                                    return (
                                        <li key={`${ingredientName}-${index}`}>
                                            <div>
                                                <strong>{ingredientName}</strong>
                                            </div>

                                            <p>
                                                {quantity} {unit}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="recipe-empty-text">
                                No ingredients were added for this recipe.
                            </p>
                        )}
                    </article>

                    <article className="recipe-detail-card recipe-instructions-card">
                        <div className="recipe-card-title">
                            <span>👩‍🍳</span>
                            <h3>Instructions</h3>
                        </div>

                        {instructionSteps.length > 0 ? (
                            <ol className="recipe-simple-instructions">
                                {instructionSteps.map((step, index) => (
                                    <li key={`${step}-${index}`}>
                                        <span>{index + 1}.</span>
                                        <p>{step}</p>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="recipe-empty-text">
                                No instructions were added for this recipe.
                            </p>
                        )}
                    </article>
                </section>

                {((recipe.tags || []).length > 0 ||
                    (recipe.allergens || []).length > 0) && (
                    <section className="recipe-extra-row">
                        {(recipe.tags || []).length > 0 && (
                            <div className="recipe-extra-group">
                                <h4>Tags</h4>

                                <div className="recipe-extra-pills">
                                    {recipe.tags.map((tag) => (
                                        <span key={tag}>
                                            #{formatText(tag)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(recipe.allergens || []).length > 0 && (
                            <div className="recipe-extra-group">
                                <h4>Allergens</h4>

                                <div className="recipe-extra-pills allergen">
                                    {recipe.allergens.map((allergen) => (
                                        <span key={allergen}>
                                            {formatText(allergen)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                <section className="recipe-detail-card recipe-reviews-card">
                    <div className="recipe-reviews-header">
                        <div className="recipe-card-title">
                            <span>⭐</span>

                            <div>
                                <h3>Reviews from other users</h3>

                                <p>
                                    See what other users thought about this recipe.
                                </p>
                            </div>
                        </div>

                        <div className="recipe-reviews-summary">
                            <strong>
                                {otherUsersReviews.length > 0
                                    ? averageRating
                                    : "-"}
                            </strong>

                            <span>/ 5</span>

                            <p>
                                {otherUsersReviews.length > 0
                                    ? renderRatingStars(averageRating)
                                    : "☆☆☆☆☆"}
                            </p>

                            <small>
                                {otherUsersReviews.length} reviews ·{" "}
                                {influencerReviewsCount} influencer
                            </small>
                        </div>
                    </div>

                    {reviewsLoading && (
                        <p className="recipe-empty-text">
                            Loading reviews...
                        </p>
                    )}

                    {!reviewsLoading && reviewsError && (
                        <p className="recipe-reviews-error">
                            {reviewsError}
                        </p>
                    )}

                    {!reviewsLoading &&
                        !reviewsError &&
                        otherUsersReviews.length === 0 && (
                            <p className="recipe-empty-text">
                                No reviews from other users yet.
                            </p>
                        )}

                    {!reviewsLoading &&
                        !reviewsError &&
                        otherUsersReviews.length > 0 && (
                            <div className="recipe-reviews-grid">
                                {otherUsersReviews.map((review) => (
                                    <ReviewCard
                                        key={review.reviewId}
                                        review={review}
                                    />
                                ))}
                            </div>
                        )}
                </section>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetailsModal;
