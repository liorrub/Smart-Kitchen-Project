import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as followService from "../services/followService";
import * as likeService from "../services/likeService";
import * as recipeService from "../services/recipeService";
import * as AuthContext from "../context/AuthContext";

jest.mock("../services/followService");
jest.mock("../services/likeService");
jest.mock("../services/recipeService");
jest.mock("../context/AuthContext");

const mockNavigate = jest.fn();
let mockParamId = "1";

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: mockParamId }),
    Link: ({ to, children, className }) => (
        <a href={to} className={className}>{children}</a>
    )
}));

// Mock FollowButton to avoid follow service calls in profile tests
jest.mock("../components/FollowButton", () =>
    function MockFollowButton({ targetUserId }) {
        return <button type="button">Follow</button>;
    }
);

// Mock RecipeCard to avoid category image imports
jest.mock("../components/RecipeCard", () =>
    function MockRecipeCard({ recipe }) {
        return <div>{recipe.title}</div>;
    }
);

// Mock PageHero
jest.mock("../components/PageHero", () =>
    function MockPageHero({ title, subtitle }) {
        return <div><h1>{title}</h1><p>{subtitle}</p></div>;
    }
);

import Profile from "./Profile";

const CHEF_PROFILE = {
    userId: 1,
    firstName: "Lior",
    lastName: "Ben-David",
    userRole: "chef",
    city: "Tel Aviv",
    cookingLevel: "advanced",
    followerCount: 22,
    followingCount: 5,
    isFollowedByMe: false
};

function renderProfile(paramId = "1", currentUser = { userId: 3, firstName: "Daniel", userRole: "user" }) {
    mockParamId = paramId;
    AuthContext.useAuth.mockReturnValue({ user: currentUser ?? null });
    return render(<Profile />);
}

describe("Profile page", () => {
    beforeEach(() => {
        followService.getUserProfile.mockResolvedValue(CHEF_PROFILE);
        recipeService.filterRecipes.mockResolvedValue([]);
        likeService.getUserLikedRecipeIds.mockResolvedValue([]);
        mockNavigate.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state initially", () => {
        followService.getUserProfile.mockImplementation(() => new Promise(() => {}));
        renderProfile();
        expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it("shows error state when profile fetch fails", async () => {
        followService.getUserProfile.mockRejectedValue(new Error("Not found"));
        renderProfile();
        await waitFor(() =>
            expect(screen.getByText(/could not load this profile/i)).toBeInTheDocument()
        );
    });

    it("renders the user's full name and city", async () => {
        renderProfile();
        await waitFor(() =>
            expect(screen.getAllByText("Lior Ben-David").length).toBeGreaterThan(0)
        );
        expect(screen.getByText(/tel aviv/i)).toBeInTheDocument();
    });

    it("shows follower count from profile data", async () => {
        renderProfile();
        await waitFor(() =>
            expect(screen.getByText("22")).toBeInTheDocument()
        );
    });

    it("shows Follow button when viewer is eligible (user viewing chef)", async () => {
        renderProfile("1", { userId: 3, firstName: "Daniel", userRole: "user" });
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^follow$/i })).toBeInTheDocument()
        );
    });

    it("does not show Follow button when viewing own profile", async () => {
        renderProfile("1", { userId: 1, firstName: "Lior", userRole: "chef" });
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^follow$/i })).not.toBeInTheDocument()
        );
    });

    it("does not show Follow button when admin views a chef", async () => {
        renderProfile("1", { userId: 2, firstName: "Ellen", userRole: "admin" });
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^follow$/i })).not.toBeInTheDocument()
        );
    });

    it("does not show Follow button when profile role is user", async () => {
        followService.getUserProfile.mockResolvedValue({ ...CHEF_PROFILE, userId: 4, userRole: "user" });
        renderProfile("4");
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^follow$/i })).not.toBeInTheDocument()
        );
    });

    it("renders Recipes, Followers, and Following tab buttons", async () => {
        renderProfile();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^recipes$/i })).toBeInTheDocument()
        );
        expect(screen.getByRole("button", { name: /^followers/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^following/i })).toBeInTheDocument();
    });

    it("fetches followers when Followers tab is clicked", async () => {
        followService.getFollowers.mockResolvedValue([]);
        renderProfile();
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^followers/i })).toBeInTheDocument()
        );
        fireEvent.click(screen.getAllByText(/followers/i)[0]);
        await waitFor(() =>
            expect(followService.getFollowers).toHaveBeenCalledWith(1)
        );
    });

    it("redirects to root when no user is logged in", async () => {
        renderProfile("1", null);
        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith("/")
        );
    });
});
