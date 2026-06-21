import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// react-router-dom v7 requires TextEncoder which is absent in this jsdom environment.
// Mock only the hooks used by UserSearch to avoid loading the full router.
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

// Mock the profile service so no real API calls are made
jest.mock("../services/profileService", () => ({
    searchUsers: jest.fn()
}));

import UserSearch from "./UserSearch";
import { searchUsers } from "../services/profileService";

const MOCK_USERS = [
    {
        userId: 1,
        firstName: "Lior",
        lastName: "R",
        username: "lior_1",
        userRole: "chef",
        city: "Tel Aviv",
        avatarKey: "chef_masculine"
    },
    {
        userId: 5,
        firstName: "Maya",
        lastName: "D",
        username: "maya_5",
        userRole: "chef",
        city: "Haifa",
        avatarKey: "chef_feminine"
    }
];

function renderSearch(onClose = jest.fn()) {
    return render(<UserSearch onClose={onClose} />);
}

beforeEach(() => {
    jest.useFakeTimers();
    searchUsers.mockResolvedValue([]);
    mockNavigate.mockReset();
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
});

describe("UserSearch", () => {
    it("renders a search input", () => {
        renderSearch();
        expect(screen.getByLabelText(/search users/i)).toBeInTheDocument();
    });

    it("does not show a result list before the user types", () => {
        renderSearch();
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("shows the result list container after typing", () => {
        renderSearch();
        const input = screen.getByLabelText(/search users/i);
        fireEvent.change(input, { target: { value: "li" } });
        expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("calls searchUsers after the 300 ms debounce", async () => {
        searchUsers.mockResolvedValue(MOCK_USERS);
        renderSearch();
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "lior" } });
        expect(searchUsers).not.toHaveBeenCalled();

        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(searchUsers).toHaveBeenCalledTimes(1);
            expect(searchUsers).toHaveBeenCalledWith("lior", "all");
        });
    });

    it("displays returned users in the result list", async () => {
        searchUsers.mockResolvedValue(MOCK_USERS);
        renderSearch();
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "li" } });
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(screen.getByText("@lior_1")).toBeInTheDocument();
            expect(screen.getByText("@maya_5")).toBeInTheDocument();
        });
    });

    it("shows 'No users found' when the search returns an empty array", async () => {
        searchUsers.mockResolvedValue([]);
        renderSearch();
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "xyz" } });
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(screen.getByText(/no users found/i)).toBeInTheDocument();
        });
    });

    it("shows an error message when searchUsers rejects", async () => {
        searchUsers.mockRejectedValue(new Error("Network error"));
        renderSearch();
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "err" } });
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(screen.getByText(/search failed/i)).toBeInTheDocument();
        });
    });

    it("calls onClose when Escape is pressed", () => {
        const onClose = jest.fn();
        renderSearch(onClose);

        fireEvent.keyDown(document, { key: "Escape" });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call searchUsers when the input is cleared to empty", async () => {
        renderSearch();
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "li" } });
        fireEvent.change(input, { target: { value: "" } });
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(searchUsers).not.toHaveBeenCalled();
        });
    });

    it("navigates to the user profile and calls onClose when a result is clicked", async () => {
        const onClose = jest.fn();
        searchUsers.mockResolvedValue(MOCK_USERS);
        renderSearch(onClose);
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "lior" } });
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            expect(screen.getByText("@lior_1")).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByRole("option")[0]);

        expect(mockNavigate).toHaveBeenCalledWith("/profile/1");
        expect(onClose).toHaveBeenCalled();
    });

    it("every result option has aria-selected attribute", async () => {
        searchUsers.mockResolvedValue(MOCK_USERS);
        renderSearch();
        const input = screen.getByLabelText(/search users/i);

        fireEvent.change(input, { target: { value: "lior" } });
        await act(async () => {
            jest.advanceTimersByTime(300);
        });

        await waitFor(() => {
            const options = screen.getAllByRole("option");
            expect(options.length).toBeGreaterThan(0);
            options.forEach(option => {
                expect(option).toHaveAttribute("aria-selected");
            });
        });
    });
});
