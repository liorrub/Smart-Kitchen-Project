import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as NotificationContext from "../context/NotificationContext";

const mockMarkRead = jest.fn();
const mockMarkAllRead = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

jest.mock("../context/NotificationContext");

// Default context values for most tests
const defaultContext = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    toasts: [],
    markRead: mockMarkRead,
    markAllRead: mockMarkAllRead,
    removeToast: jest.fn(),
    loadNotifications: jest.fn()
};

const SAMPLE_NOTIFICATION = {
    notificationId: 101,
    type: "follow",
    message: "Lior started following you.",
    sourceUser: { userId: 1, firstName: "Lior", lastName: "Rubinshtein" },
    entityId: 1,
    entityType: "user",
    isRead: false,
    createdAt: new Date().toISOString()
};

import NotificationBell from "./NotificationBell";

function renderBell(ctx = {}) {
    NotificationContext.useNotifications.mockReturnValue({ ...defaultContext, ...ctx });
    return render(<NotificationBell />);
}

describe("NotificationBell", () => {
    beforeEach(() => {
        mockMarkRead.mockReset();
        mockMarkAllRead.mockReset();
        mockNavigate.mockReset();
    });

    // 1. Bell is rendered
    it("1. renders the bell button", () => {
        renderBell();
        expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
    });

    // 2. Badge hidden when unreadCount is 0
    it("2. does not show badge when unreadCount is 0", () => {
        renderBell({ unreadCount: 0 });
        expect(screen.queryByText(/^\d+\+?$/)).not.toBeInTheDocument();
    });

    // 3. Badge visible when unreadCount > 0
    it("3. shows badge when unreadCount > 0", () => {
        renderBell({ unreadCount: 3 });
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    // 4. Badge shows 9+ for large counts
    it("4. badge shows 9+ for counts > 9", () => {
        renderBell({ unreadCount: 15 });
        expect(screen.getByText("9+")).toBeInTheDocument();
    });

    // 5. Badge shows 99+ for very large counts
    it("5. badge shows 99+ for counts > 99", () => {
        renderBell({ unreadCount: 150 });
        expect(screen.getByText("99+")).toBeInTheDocument();
    });

    // 6. Clicking bell opens dropdown
    it("6. clicking bell opens the dropdown", () => {
        renderBell();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // 7. Clicking bell again closes dropdown
    it("7. clicking bell again closes the dropdown", () => {
        renderBell();
        const bell = screen.getByRole("button", { name: /notifications/i });
        fireEvent.click(bell);
        fireEvent.click(bell);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 8. Empty state shows "No notifications yet"
    it("8. shows empty state when no notifications", () => {
        renderBell({ notifications: [] });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        expect(screen.getByText(/no notifications yet/i)).toBeInTheDocument();
    });

    // 9. Notifications render in dropdown
    it("9. renders notifications in the dropdown", () => {
        renderBell({ notifications: [SAMPLE_NOTIFICATION] });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        expect(screen.getByText("Lior started following you.")).toBeInTheDocument();
    });

    // 10. Unread item has distinct visual class
    it("10. unread notifications have unread class", () => {
        renderBell({ notifications: [SAMPLE_NOTIFICATION], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        const items = document.querySelectorAll(".notif-item--unread");
        expect(items.length).toBeGreaterThan(0);
    });

    // 11. Mark-all-read button shown when unread > 0
    it("11. mark-all-read button shown when there are unread notifications", () => {
        renderBell({ notifications: [SAMPLE_NOTIFICATION], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        expect(screen.getByRole("button", { name: /mark all read/i })).toBeInTheDocument();
    });

    // 12. Mark-all-read button calls markAllRead
    it("12. clicking mark-all-read calls markAllRead", async () => {
        renderBell({ notifications: [SAMPLE_NOTIFICATION], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        fireEvent.click(screen.getByRole("button", { name: /mark all read/i }));
        await waitFor(() => expect(mockMarkAllRead).toHaveBeenCalledTimes(1));
    });

    // 13. Clicking a notification calls markRead and navigates
    it("13. clicking a follow notification calls markRead and navigates to profile", async () => {
        mockMarkRead.mockResolvedValue({});
        renderBell({ notifications: [SAMPLE_NOTIFICATION], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        fireEvent.click(screen.getByText("Lior started following you."));

        await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith(101));
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/profile/1"));
    });

    // 14. Clicking a comment_reply notification navigates to recipe discussion
    it("14. clicking a comment_reply notification navigates to recipe discussion", async () => {
        const replyNotif = {
            ...SAMPLE_NOTIFICATION,
            notificationId: 102,
            type: "comment_reply",
            message: "Lior replied to your comment.",
            entityId: 5,
            entityType: "recipe"
        };
        mockMarkRead.mockResolvedValue({});
        renderBell({ notifications: [replyNotif], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        fireEvent.click(screen.getByText("Lior replied to your comment."));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/recipes/5/discussion"));
    });

    // 15. Clicking a chef_approved notification navigates to settings
    it("15. clicking chef_approved navigates to /settings", async () => {
        const approvedNotif = {
            ...SAMPLE_NOTIFICATION,
            notificationId: 103,
            type: "chef_approved",
            message: "Your chef request has been approved!",
            isRead: false,
            entityId: 2,
            entityType: "chef_request",
            sourceUser: { userId: 2, firstName: "Ellen", lastName: "Levin" }
        };
        mockMarkRead.mockResolvedValue({});
        renderBell({ notifications: [approvedNotif], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        fireEvent.click(screen.getByText("Your chef request has been approved!"));

        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/settings"));
    });

    // 16. recipe_comment notification navigates to recipe discussion with commentId
    it("16. clicking a recipe_comment notification navigates to recipe discussion", async () => {
        const recipeCommentNotif = {
            ...SAMPLE_NOTIFICATION,
            notificationId: 104,
            type: "recipe_comment",
            message: "Daniel commented on your recipe.",
            entityId: 101,
            entityType: "recipe",
            commentId: 200,
            isRead: false
        };
        mockMarkRead.mockResolvedValue({});
        renderBell({ notifications: [recipeCommentNotif], unreadCount: 1 });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        fireEvent.click(screen.getByText("Daniel commented on your recipe."));

        await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith(104));
        await waitFor(() =>
            expect(mockNavigate).toHaveBeenCalledWith("/recipes/101/discussion?commentId=200")
        );
    });

    // 17. Escape key closes the dropdown
    it("17. Escape key closes the dropdown", () => {
        renderBell();
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // 18. Loading state shows loading message
    it("18. shows loading state", () => {
        renderBell({ loading: true, notifications: [] });
        fireEvent.click(screen.getByRole("button", { name: /notifications/i }));
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
});
