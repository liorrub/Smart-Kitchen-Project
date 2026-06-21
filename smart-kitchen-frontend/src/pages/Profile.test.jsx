import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as profileService from "../services/profileService";
import * as followService from "../services/followService";
import * as AuthContext from "../context/AuthContext";

jest.mock("../services/profileService");
jest.mock("../services/followService");
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

// Mock FollowButton to isolate profile logic
jest.mock("../components/FollowButton", () =>
    function MockFollowButton() {
        return <button type="button">Follow</button>;
    }
);

// Mock RecipeCard to avoid category image imports
jest.mock("../components/RecipeCard", () =>
    function MockRecipeCard({ recipe }) {
        return <div>{recipe.title}</div>;
    }
);

// Mock RecipeDetailsModal
jest.mock("../components/RecipeDetailsModal", () =>
    function MockModal() {
        return null;
    }
);

// Mock PageHero
jest.mock("../components/PageHero", () =>
    function MockPageHero({ title }) {
        return <h1>{title}</h1>;
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
    recipeCount: 12,
    reviewCount: 0,
    totalHelpfulVotes: 0,
    avgRating: 4.5,
    totalRatings: 8,
    followerCount: 22,
    followingCount: 5,
    isFollowedByMe: false,
    recentRecipes: []
};

function renderProfile(paramId = "1") {
    mockParamId = paramId;
    return render(<Profile />);
}

describe("Profile page", () => {
    beforeEach(() => {
        AuthContext.useAuth.mockReturnValue({ user: null });
        profileService.getUserProfile.mockResolvedValue(CHEF_PROFILE);
        followService.getFollowers.mockResolvedValue([]);
        followService.getFollowing.mockResolvedValue([]);
        mockNavigate.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("shows loading state initially", () => {
        profileService.getUserProfile.mockImplementation(() => new Promise(() => {}));
        renderProfile();
        expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it("shows error state when profile fetch fails", async () => {
        profileService.getUserProfile.mockRejectedValue(new Error("Not found"));
        renderProfile();
        await waitFor(() =>
            expect(screen.getByText(/profile not found/i)).toBeInTheDocument()
        );
    });

    it("renders the user's full name", async () => {
        renderProfile();
        await waitFor(() =>
            expect(screen.getAllByText("Lior Ben-David").length).toBeGreaterThan(0)
        );
    });

    it("shows follower count from profile data", async () => {
        renderProfile();
        await waitFor(() =>
            expect(screen.getByText("22")).toBeInTheDocument()
        );
    });

    it("shows Follow button when viewer role is eligible and target is chef", async () => {
        // getStoredUser returns user role — we need a non-admin, non-self viewer
        // The component uses getStoredUser(), not useAuth — mock sessionStorage
        const mockUser = { userId: 3, firstName: "Daniel", userRole: "user" };
        jest.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(mockUser));

        renderProfile("1");
        await waitFor(() =>
            expect(screen.getByRole("button", { name: /^follow$/i })).toBeInTheDocument()
        );

        jest.restoreAllMocks();
    });

    it("does not show Follow button when viewing own profile", async () => {
        const mockUser = { userId: 1, firstName: "Lior", userRole: "chef" };
        jest.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(mockUser));

        renderProfile("1");
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^follow$/i })).not.toBeInTheDocument()
        );

        jest.restoreAllMocks();
    });

    it("does not show Follow button when viewer role is admin", async () => {
        const mockUser = { userId: 2, firstName: "Ellen", userRole: "admin" };
        jest.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(mockUser));

        renderProfile("1");
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^follow$/i })).not.toBeInTheDocument()
        );

        jest.restoreAllMocks();
    });

    it("does not show Follow button when profile role is user", async () => {
        profileService.getUserProfile.mockResolvedValue({ ...CHEF_PROFILE, userId: 4, userRole: "user" });
        const mockUser = { userId: 3, firstName: "Daniel", userRole: "user" };
        jest.spyOn(Storage.prototype, "getItem").mockReturnValue(JSON.stringify(mockUser));

        renderProfile("4");
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^follow$/i })).not.toBeInTheDocument()
        );

        jest.restoreAllMocks();
    });

    it("fetches followers when Followers stat is clicked", async () => {
        followService.getFollowers.mockResolvedValue([
            { followId: 1, followerId: 3, follower: { firstName: "Daniel", lastName: "Cohen", userRole: "user" } }
        ]);
        renderProfile();
        await waitFor(() => expect(screen.getByText("22")).toBeInTheDocument());

        fireEvent.click(screen.getByText("Followers"));
        await waitFor(() =>
            expect(followService.getFollowers).toHaveBeenCalledWith(1)
        );
    });
});
