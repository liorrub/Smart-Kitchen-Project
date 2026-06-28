import "./RecipeCard.css";

import { Link } from "react-router-dom";

import { resolveImageUrl } from "../utils/apiConfig";
import { getCategoryDefaultImage, handleImageError } from "../utils/recipeImageUtils";
import { formatText } from "../utils/formatUtils";
import ShareRecipeButton from "./ShareRecipeButton";

function getCategoryClass(category) {
    const validCategories = ["breakfast", "lunch", "dinner", "dessert", "snack"];
    return validCategories.includes(category)
        ? `recipe-card-${category}`
        : "recipe-card-default";
}

/*
    Reusable recipe preview card.
    Image banner spans full card width; content sits below in a padded area.
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
    showShareButton = false,
    actions
}) {
    const recipeImage = resolveImageUrl(recipe.imageUrl) || getCategoryDefaultImage(recipe.category);
    const imagePositionX = recipe.imageUrl ? (recipe.imagePositionX ?? 50) : 50;
    const imagePositionY = recipe.imageUrl ? (recipe.imagePositionY ?? 50) : 50;
    const categoryClass = getCategoryClass(recipe.category);

    function handleViewClick() {
        if (onClick) onClick(recipe);
    }

    function handleFavoriteClick() {
        if (onFavoriteClick) onFavoriteClick(recipe);
    }

    function handleLikeClick() {
        if (onLikeClick) onLikeClick(recipe);
    }

    const defaultFavoriteText = isFavorite ? "Saved" : "Save";

    return (
        <article className={`recipe-card ${categoryClass}`}>

            {/* Full-width image banner — outside padded area so it reaches card edges */}
            <div className="recipe-card-image-wrapper">
                <img
                    src={recipeImage}
                    alt={recipe.title}
                    className="recipe-card-image"
                    style={{ objectPosition: `${imagePositionX}% ${imagePositionY}%` }}
                    onError={(e) => handleImageError(e, recipe.category)}
                />
                <span className="recipe-card-category">
                    {formatText(recipe.category)}
                </span>
            </div>

            {/* Card body */}
            <div className="recipe-card-inner">
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
                                <span key={tag}>#{formatText(tag)}</span>
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
                                className={isLiked ? "recipe-card-like-button active" : "recipe-card-like-button"}
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
                                className={isFavorite ? "recipe-card-favorite-button active" : "recipe-card-favorite-button"}
                                disabled={favoriteLoading}
                                onClick={handleFavoriteClick}
                            >
                                {favoriteLoading ? favoriteLoadingText : favoriteButtonText || defaultFavoriteText}
                            </button>
                        )}

                        {showShareButton && (
                            <ShareRecipeButton
                                recipe={recipe}
                                compact
                                onClick={(e) => e.stopPropagation()}
                            />
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
