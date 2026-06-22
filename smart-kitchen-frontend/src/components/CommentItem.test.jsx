import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

import CommentItem from "./CommentItem";

const MOCK_COMMENT = {
    commentId: 42,
    recipeId: 101,
    userId: 7,
    content: "This recipe is amazing!",
    author: {
        userId: 7,
        firstName: "Avi",
        lastName: "Cohen",
        avatarKey: "chef_masculine"
    },
    mentionedUser: null,
    parentCommentId: null,
    likeCount: 3,
    isLikedByMe: false,
    createdAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-06-10T10:00:00Z"
};

const CURRENT_USER = { userId: 4, firstName: "Daniel", lastName: "Levi", userRole: "user" };

function renderItem(props = {}) {
    return render(
        <CommentItem
            comment={MOCK_COMMENT}
            currentUser={CURRENT_USER}
            onReply={jest.fn()}
            onEdit={jest.fn()}
            onDeleteRequest={jest.fn()}
            onLikeClick={jest.fn()}
            {...props}
        />
    );
}

describe("CommentItem", () => {
    it("renders the like button", () => {
        renderItem();
        expect(screen.getByRole("button", { name: /like comment/i })).toBeInTheDocument();
    });

    it("renders the like count", () => {
        renderItem();
        expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("aria-pressed is false when not liked", () => {
        renderItem();
        const btn = screen.getByRole("button", { name: /like comment/i });
        expect(btn).toHaveAttribute("aria-pressed", "false");
    });

    it("aria-pressed is true when liked", () => {
        renderItem({ comment: { ...MOCK_COMMENT, isLikedByMe: true, likeCount: 4 } });
        const btn = screen.getByRole("button", { name: /unlike comment/i });
        expect(btn).toHaveAttribute("aria-pressed", "true");
    });

    it("calls onLikeClick with commentId when like button is clicked", () => {
        const onLikeClick = jest.fn();
        renderItem({ onLikeClick });
        fireEvent.click(screen.getByRole("button", { name: /like comment/i }));
        expect(onLikeClick).toHaveBeenCalledWith(42);
    });

    it("like button is disabled when isLiking is true", () => {
        renderItem({ isLiking: true });
        expect(screen.getByRole("button", { name: /like comment/i })).toBeDisabled();
    });

    it("like button is disabled when viewing own comment (self-like)", () => {
        const selfUser = { ...CURRENT_USER, userId: 7 }; // same as comment.userId
        renderItem({ currentUser: selfUser });
        const btn = screen.getByRole("button", { name: /cannot like your own comment/i });
        expect(btn).toBeDisabled();
    });

    it("reply button still works alongside like button", () => {
        const onReply = jest.fn();
        renderItem({ onReply });
        fireEvent.click(screen.getByRole("button", { name: /reply/i }));
        expect(onReply).toHaveBeenCalled();
    });

    it("like button renders on reply comments (isReply=true)", () => {
        renderItem({
            isReply: true,
            comment: { ...MOCK_COMMENT, parentCommentId: 41 }
        });
        expect(screen.getByRole("button", { name: /like comment/i })).toBeInTheDocument();
    });

    it("profile link still renders alongside like button", () => {
        renderItem();
        const links = screen.getAllByRole("link");
        expect(links.some((l) => l.href.includes("/profile/7"))).toBe(true);
    });

    it("shows filled heart icon when liked", () => {
        renderItem({ comment: { ...MOCK_COMMENT, isLikedByMe: true } });
        expect(screen.getByText("♥")).toBeInTheDocument();
    });

    it("shows empty heart icon when not liked", () => {
        renderItem();
        expect(screen.getByText("♡")).toBeInTheDocument();
    });
});
