import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as followService from "../services/followService";
import * as likeService from "../services/likeService";
import * as AuthContext from "../context/AuthContext";

jest.mock("../services/followService");
jest.mock("../services/likeService");
jest.mock("../context/AuthContext");

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    Link: ({ to, children, className }) => (
        <a href={to} className={className}>{children}</a>
    )
}));

// Import Feed AFTER mocking so it picks up the mocked modules
let Feed;
beforeAll(async () => {
    Feed = (await import("./Feed")).default;
});

const MOCK_USER = { userId: 3, firstName: "Daniel", lastName: "Cohen", userRole: "user" };

function renderFeed() {
    const { render: rtlRender } = require("@testing-library/react");
    return rtlRender(<Feed />);
}

describe("Feed page", () => {
    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: MOCK_USER });
        likeService.getUserLikedRecipeIds.mockResolvedValue([]);
        mockNavigate.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state initially", () => {
        followService.getFeed.mockImplementation(() => new Promise(() => {}));
        render(<Feed />);
        expect(screen.getByText(/loading your feed/i)).toBeInTheDocument();
    });

    it("shows empty state when feed returns no recipes", async () => {
        followService.getFeed.mockResolvedValue([]);
        render(<Feed />);
        await waitFor(() =>
            expect(screen.getByText(/your feed is empty/i)).toBeInTheDocument()
        );
        expect(screen.getByRole("link", { name: /browse recipes/i })).toBeInTheDocument();
    });

    it("shows error state when feed request fails", async () => {
        followService.getFeed.mockRejectedValue(new Error("Network error"));
        render(<Feed />);
        await waitFor(() =>
            expect(screen.getByText(/could not load your feed/i)).toBeInTheDocument()
        );
    });

    it("renders recipe titles when feed has recipes", async () => {
        followService.getFeed.mockResolvedValue([
            {
                recipeId: 10,
                title: "Shakshuka",
                category: "breakfast",
                difficulty: "easy",
                cuisine: "israeli",
                totalTime: 30,
                servings: 2,
                tags: [],
                likeCount: 5,
                creator: { userId: 1, firstName: "Lior", lastName: "Ben-David" }
            }
        ]);
        render(<Feed />);
        await waitFor(() =>
            expect(screen.getByText("Shakshuka")).toBeInTheDocument()
        );
    });

    it("shows creator attribution link for each recipe", async () => {
        followService.getFeed.mockResolvedValue([
            {
                recipeId: 11,
                title: "Pasta Primavera",
                category: "dinner",
                difficulty: "medium",
                cuisine: "italian",
                totalTime: 40,
                servings: 4,
                tags: [],
                likeCount: 2,
                creator: { userId: 1, firstName: "Lior", lastName: "Ben-David" }
            }
        ]);
        render(<Feed />);
        await waitFor(() => {
            const creatorLink = screen.getByText("Lior Ben-David");
            expect(creatorLink.closest("a")).toHaveAttribute("href", "/profile/1");
        });
    });

    it("redirects to root when no user is logged in", () => {
        AuthContext.useAuth.mockReturnValue({ user: null });
        followService.getFeed.mockResolvedValue([]);
        render(<Feed />);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
});
