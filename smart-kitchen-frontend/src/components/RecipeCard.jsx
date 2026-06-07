import "./RecipeCard.css";

import breakfastImg from "../assets/breakfast.png";
import lunchImg from "../assets/lunch.png";
import dinnerImg from "../assets/dinner.png";
import snackImg from "../assets/snack.png";

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

function getCategoryImage(category) {
    const images = {
        breakfast: breakfastImg,
        lunch: lunchImg,
        dinner: dinnerImg,
        snack: snackImg
    };

    return images[category] || lunchImg;
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
    Receives recipe data using props and displays a compact recipe preview.
*/
function RecipeCard({ recipe, onClick }) {
    const categoryImage = getCategoryImage(recipe.category);
    const categoryClass = getCategoryClass(recipe.category);

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

                    <button
                        type="button"
                        className="recipe-card-view-button"
                        onClick={() => onClick(recipe)}
                    >
                        View Recipe
                    </button>
                </div>
            </div>
        </article>
    );
}

export default RecipeCard;
