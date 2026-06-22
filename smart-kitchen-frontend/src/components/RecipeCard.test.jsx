import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import RecipeCard from "./RecipeCard";
import RecipeDetailsModal from "./RecipeDetailsModal";
import { getCategoryDefaultImage } from "../utils/recipeImageUtils";

jest.mock("react-router-dom", () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => jest.fn()
}));

jest.mock("../services/reviewsService", () => ({
    getRecipeReviews: jest.fn().mockResolvedValue([]),
    createRecipeReview: jest.fn(),
    updateRecipeReview: jest.fn(),
    deleteRecipeReview: jest.fn(),
    toggleReviewHelpfulVote: jest.fn(),
    reportReview: jest.fn()
}));

jest.mock("../utils/authUtils", () => ({
    getStoredUser: jest.fn().mockReturnValue(null)
}));

jest.mock("./ReviewCard", () => function MockReviewCard() { return null; });
jest.mock("./ReviewForm", () => function MockReviewForm() { return null; });
jest.mock("./ShareRecipeButton", () => function MockShareRecipeButton() { return null; });

const baseRecipe = {
    recipeId: 101,
    title: "Simple Pasta",
    category: "dinner",
    cuisine: "italian",
    difficulty: "easy",
    prepTime: 10,
    cookTime: 20,
    totalTime: 30,
    servings: 4,
    calories: 400,
    tags: ["quick"],
    allergens: [],
    ingredients: [],
    instructions: "Boil pasta. Add sauce."
};

// ── Test 9: RecipeDetailsModal always shows an image ──────────────────────

test("RecipeDetailsModal displays a fallback image when imageUrl is missing", async () => {
    const recipeNoImage = { ...baseRecipe };
    delete recipeNoImage.imageUrl;

    render(<RecipeDetailsModal recipe={recipeNoImage} onClose={jest.fn()} />);

    const img = await screen.findByRole("img", { name: /simple pasta/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", getCategoryDefaultImage("dinner"));
});

// ── Test 10: RecipeCard renders correctly with image and all controls ──────

test("RecipeCard renders title, meta, and view button; uses imageUrl when provided", () => {
    const recipeWithImage = {
        ...baseRecipe,
        imageUrl: "https://example.com/pasta.jpg",
        imagePositionX: 50,
        imagePositionY: 30
    };

    render(
        <RecipeCard
            recipe={recipeWithImage}
            onClick={jest.fn()}
            showFavoriteButton
            onFavoriteClick={jest.fn()}
            showLikeButton
            likeCount={5}
            onLikeClick={jest.fn()}
        />
    );

    expect(screen.getByText("Simple Pasta")).toBeInTheDocument();
    expect(screen.getByText("View Recipe")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();

    const img = screen.getByRole("img", { name: /simple pasta/i });
    expect(img).toHaveAttribute("src", "https://example.com/pasta.jpg");
    expect(img).toHaveStyle({ objectPosition: "50% 30%" });
});
