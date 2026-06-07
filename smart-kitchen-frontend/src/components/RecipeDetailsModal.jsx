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
        .split(/,\s*|\.\s+/)
        .map((step) => step.trim())
        .filter(Boolean);
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

/*
    Modal for displaying the full selected recipe.
    Also loads and displays reviews for the selected recipe.
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

    const otherUsersReviews = useMemo(() => {
        return reviews.filter(
            (review) => review.userId !== currentUser?.userId
        );
    }, [reviews, currentUser?.userId]);

    const averageRating = getAverageRating(otherUsersReviews);
    const influencerReviewsCount = otherUsersReviews.filter(
        (review) => review.isInfluencer
    ).length;

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

                <section className="recipe-modal-section">
                    <div className="recipe-modal-section-title recipe-reviews-title">
                        <span>⭐</span>

                        <div>
                            <h3>Reviews from other users</h3>

                            <p>
                                {otherUsersReviews.length > 0
                                    ? `${averageRating}/5 average rating · ${otherUsersReviews.length} reviews · ${influencerReviewsCount} influencer reviews`
                                    : "No reviews from other users yet."}
                            </p>
                        </div>
                    </div>

                    {reviewsLoading && (
                        <p className="recipe-modal-empty-text">
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
                            <p className="recipe-modal-empty-text">
                                Community feedback will appear here.
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
