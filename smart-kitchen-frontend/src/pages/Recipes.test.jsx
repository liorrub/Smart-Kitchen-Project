import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
    useNavigate: () => jest.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock("axios", () => ({
    get: jest.fn()
}));

jest.mock("../services/favoritesService", () => ({
    getUserFavorites: jest.fn().mockResolvedValue([]),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn()
}));

jest.mock("../services/likeService", () => ({
    getUserLikedRecipeIds: jest.fn().mockResolvedValue([]),
    likeRecipe: jest.fn(),
    unlikeRecipe: jest.fn()
}));

// Returns a user so the component takes the Promise.all path
jest.mock("../utils/authUtils", () => ({
    getStoredUser: jest.fn().mockReturnValue({ userId: 1, userRole: "user" })
}));

jest.mock("../components/PageHero", () =>
    function MockPageHero() { return <div data-testid="page-hero" />; }
);
jest.mock("../components/MessageModal", () =>
    function MockMessageModal() { return null; }
);
jest.mock("../components/RecipeDetailsModal", () =>
    function MockRecipeDetailsModal() { return null; }
);
jest.mock("../components/CustomSelect", () =>
    function MockCustomSelect({ label, name, value, onChange, options }) {
        return (
            <select aria-label={label} name={name} value={value} onChange={onChange}>
                {(options || []).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        );
    }
);
jest.mock("../components/FormField", () =>
    function MockFormField({ label, onChange, value }) {
        return <input aria-label={label} value={value} onChange={onChange} />;
    }
);

// Mock RecipeCard to render a testable stub that exposes key prop values as data attributes.
// Using a named function (not a spy) avoids jest.mock hoisting issues.
jest.mock("../components/RecipeCard", () =>
    function MockRecipeCard({ recipe, showFavoriteButton, showLikeButton, onClick }) {
        return (
            <div
                data-testid="recipe-card"
                data-recipe-id={recipe?.recipeId}
                data-show-favorite={String(!!showFavoriteButton)}
                data-show-like={String(!!showLikeButton)}
                data-has-onclick={String(typeof onClick === "function")}
            >
                {recipe?.title}
            </div>
        );
    }
);

import Recipes from "./Recipes";
import axios from "axios";

// prepTime is included so sort-by-prep tests can verify card reordering.
const MOCK_RECIPES = [
    {
        recipeId: 10,
        title: "Pasta Primavera",
        category: "lunch",
        cuisine: "italian",
        difficulty: "easy",
        prepTime: 25,
        totalTime: 35,
        servings: 2,
        tags: ["quick"],
        likeCount: 3
    },
    {
        recipeId: 11,
        title: "Avocado Toast",
        category: "breakfast",
        cuisine: "american",
        difficulty: "easy",
        prepTime: 10,
        totalTime: 10,
        servings: 1,
        tags: [],
        likeCount: 0
    }
];

beforeEach(() => {
    axios.get.mockResolvedValue({ data: { success: true, data: MOCK_RECIPES } });
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Recipes page — layout, component reuse, and sorting", () => {
    it("renders the recipes-grid container with the correct CSS class", async () => {
        const { container } = render(<Recipes />);

        await waitFor(() => {
            expect(container.querySelector(".recipes-grid")).toBeInTheDocument();
        });
    });

    it("uses the shared RecipeCard component — one per recipe, no inline duplicate", async () => {
        render(<Recipes />);

        await waitFor(() => {
            const cards = screen.getAllByTestId("recipe-card");
            expect(cards).toHaveLength(MOCK_RECIPES.length);
        });
    });

    it("recipe titles are rendered via RecipeCard (not a custom inline implementation)", async () => {
        render(<Recipes />);

        await waitFor(() => {
            expect(screen.getByText("Pasta Primavera")).toBeInTheDocument();
            expect(screen.getByText("Avocado Toast")).toBeInTheDocument();
        });
    });

    it("passes showFavoriteButton=true to each RecipeCard", async () => {
        render(<Recipes />);

        await waitFor(() => {
            const cards = screen.getAllByTestId("recipe-card");
            cards.forEach(card => {
                expect(card).toHaveAttribute("data-show-favorite", "true");
            });
        });
    });

    it("passes showLikeButton=true to each RecipeCard", async () => {
        render(<Recipes />);

        await waitFor(() => {
            const cards = screen.getAllByTestId("recipe-card");
            cards.forEach(card => {
                expect(card).toHaveAttribute("data-show-like", "true");
            });
        });
    });

    it("passes an onClick handler to each RecipeCard", async () => {
        render(<Recipes />);

        await waitFor(() => {
            const cards = screen.getAllByTestId("recipe-card");
            cards.forEach(card => {
                expect(card).toHaveAttribute("data-has-onclick", "true");
            });
        });
    });

    it("shows empty state when no recipes are returned", async () => {
        axios.get.mockResolvedValue({ data: { success: true, data: [] } });
        render(<Recipes />);

        await waitFor(() => {
            expect(screen.getByText(/no recipes found/i)).toBeInTheDocument();
        });
    });

    it("renders a Sort by dropdown control", async () => {
        render(<Recipes />);

        await waitFor(() => {
            expect(screen.getByRole("combobox", { name: /sort by/i })).toBeInTheDocument();
        });
    });

    it("sort by prep time ascending reorders recipe cards shortest first", async () => {
        render(<Recipes />);

        // Wait for cards to load (Pasta=25 min, Avocado=10 min — API order is Pasta first)
        await waitFor(() => {
            expect(screen.getAllByTestId("recipe-card")).toHaveLength(2);
        });

        const sortSelect = screen.getByRole("combobox", { name: /sort by/i });
        fireEvent.change(sortSelect, { target: { value: "prep-asc" } });

        await waitFor(() => {
            const cards = screen.getAllByTestId("recipe-card");
            // Avocado Toast (10 min) must come before Pasta Primavera (25 min)
            expect(cards[0].textContent).toBe("Avocado Toast");
            expect(cards[1].textContent).toBe("Pasta Primavera");
        });
    });

    it("clearing filters resets sort back to default API order", async () => {
        render(<Recipes />);

        await waitFor(() => {
            expect(screen.getAllByTestId("recipe-card")).toHaveLength(2);
        });

        // Apply prep-asc → Avocado Toast (10 min) moves to position 0
        const sortSelect = screen.getByRole("combobox", { name: /sort by/i });
        fireEvent.change(sortSelect, { target: { value: "prep-asc" } });

        await waitFor(() => {
            expect(screen.getAllByTestId("recipe-card")[0].textContent).toBe("Avocado Toast");
        });

        // Clear filters resets sort to "default" — API order: Pasta Primavera (recipeId 10) first
        fireEvent.click(screen.getByText("Clear filters"));

        await waitFor(() => {
            expect(screen.getAllByTestId("recipe-card")[0].textContent).toBe("Pasta Primavera");
        });
    });
});
