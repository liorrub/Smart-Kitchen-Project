import "./RecipeCard.css";

import { Link } from "react-router-dom";
import breakfastImg from "../assets/breakfast.png";
import defaultImg from "../assets/default.png";
import dinnerImg from "../assets/dinner.png";
import lunchImg from "../assets/lunch.png";
import snackImg from "../assets/snack.png";

import { formatText } from "../utils/formatUtils";

function getCategoryImage(category) {
    const images = {
        breakfast: breakfastImg,
        lunch: lunchImg,
        dinner: dinnerImg,
        snack: snackImg
    };

    return images[category] || defaultImg;
}

function getCategoryClass(category) {
    const validCategories = [
        "breakfast",
        "lunch",
        "dinner",
        "snack"
    ];

    return validCategories.includes(category)
        ? `recipe-card-${category}`
        : "recipe-card-default";
}

/*
    Reusable recipe preview card.
    Can be used in Recipes, Favorites, and Feed pages.
*/
function RecipeCard({
                        recipe,
                        onClick,
                        showFavoriteButton = false,
                        isFavorite = false,
                        onFavoriteClick,
                        favoriteLoading = false,
                        favoriteButtonText = "",
                        favoriteLoadingText = "Saving...",
                        showLikeButton = false,
                        isLiked = false,
                        likeCount = 0,
                        onLikeClick,
                        likeLoading = false,
                        showCreator = false,
                        actions
                    }) {
    const categoryImage = getCategoryImage(recipe.category);
    const categoryClass = getCategoryClass(recipe.category);

    function handleViewClick() {
        if (onClick) {
            onClick(recipe);
        }
    }

    function handleFavoriteClick() {
        if (onFavoriteClick) {
            onFavoriteClick(recipe);
        }
    }

    function handleLikeClick() {
        if (onLikeClick) {
            onLikeClick(recipe);
        }
    }

    const defaultFavoriteText = isFavorite
        ? "♥ Saved"
        : "♡ Save";

    return (
        <article className={`recipe-card ${categoryClass}`}>
            <div className="recipe-card-inner">
                <div className="recipe-card-header">
                    <div className="recipe-card-image-wrapper">
                        <img
                            src={categoryImage}
                            alt={recipe.title}
                            className="recipe-card-image"
                        />
                    </div>

                    <span className="recipe-card-category">
                        {formatText(recipe.category)}
                    </span>
                </div>

                <div className="recipe-card-content">
                    <h3>{recipe.title}</h3>

                    {showCreator && recipe.creator && (
                        <Link
                            to={`/profile/${recipe.creator.userId}`}
                            className="recipe-card-creator-link"
                            onClick={e => e.stopPropagation()}
                        >
                            by {recipe.creator.firstName} {recipe.creator.lastName}
                        </Link>
                    )}

                    <div className="recipe-card-meta">
                        <span>⏱ {recipe.totalTime || 0} min</span>
                        <span>👥 {recipe.servings || 1}</span>
                        <span>{formatText(recipe.difficulty)}</span>
                    </div>

                    {(recipe.tags || []).length > 0 && (
                        <div className="recipe-card-tags">
                            {(recipe.tags || []).slice(0, 2).map((tag) => (
                                <span key={tag}>
                                    #{formatText(tag)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="recipe-card-footer">
                    <span className="recipe-card-cuisine">
                        {formatText(recipe.cuisine)} cuisine
                    </span>

                    <div className="recipe-card-actions">
                        {showLikeButton && (
                            <button
                                type="button"
                                className={
                                    isLiked
                                        ? "recipe-card-like-button active"
                                        : "recipe-card-like-button"
                                }
                                disabled={likeLoading}
                                onClick={handleLikeClick}
                                title={isLiked ? "Unlike" : "Like"}
                            >
                                {isLiked ? "❤️" : "🤍"} {likeCount}
                            </button>
                        )}

                        {showFavoriteButton && (
                            <button
                                type="button"
                                className={
                                    isFavorite
                                        ? "recipe-card-favorite-button active"
                                        : "recipe-card-favorite-button"
                                }
                                disabled={favoriteLoading}
                                onClick={handleFavoriteClick}
                            >
                                {favoriteLoading
                                    ? favoriteLoadingText
                                    : favoriteButtonText || defaultFavoriteText}
                            </button>
                        )}

                        <button
                            type="button"
                            className="recipe-card-view-button"
                            onClick={handleViewClick}
                        >
                            View Recipe
                        </button>
                    </div>

                    {actions && (
                        <div className="recipe-card-extra-actions">
                            {actions}
                        </div>
                    )}

                </div>
            </div>
        </article>
    );
}

export default RecipeCard;
