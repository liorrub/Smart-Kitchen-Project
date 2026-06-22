import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("./AvatarImage", () => function MockAvatar({ firstName, lastName }) {
    return <div data-testid="avatar">{firstName?.[0]}{lastName?.[0]}</div>;
});

jest.mock("./ReviewReportModal", () => function MockReportModal({ onSubmit, onClose, loading, submitError }) {
    return (
        <div data-testid="report-modal">
            <button onClick={() => !loading && onSubmit({ reason: "spam" })} disabled={!!loading}>Submit</button>
            <button onClick={onClose}>Close</button>
            {submitError && <p data-testid="submit-error">{submitError}</p>}
        </div>
    );
});

import ReviewCard from "./ReviewCard";

const baseReview = {
    reviewId: 10,
    userId: 5,
    recipeId: 101,
    rating: 4,
    title: "Great recipe",
    comment: "Loved making this dish.",
    helpfulCount: 3,
    viewerHasMarkedHelpful: false,
    createdAt: "2026-06-01T00:00:00.000Z",
    author: {
        userId: 5,
        firstName: "Maya",
        lastName: "Cohen",
        username: "maya_c",
        avatarKey: "home_cook_neutral_01",
        userRole: "user"
    }
};

const currentUser = { userId: 2, userRole: "user" };
const ownerUser = { userId: 5, userRole: "user" };
const adminUser = { userId: 99, userRole: "admin" };

describe("ReviewCard", () => {
    // 1. Renders @username (not full name) when review.author is present
    it("1. renders @username (not full name) when review.author is present", () => {
        render(<ReviewCard review={baseReview} />);
        expect(screen.getByText("@maya_c")).toBeInTheDocument();
        expect(screen.queryByText("Maya Cohen")).not.toBeInTheDocument();
    });

    // 2. Falls back to User #N when review.author is absent
    it("2. falls back to User #N when author is missing", () => {
        const review = { ...baseReview, author: null };
        render(<ReviewCard review={review} />);
        expect(screen.getByText("User #5")).toBeInTheDocument();
    });

    // 3. Renders @username
    it("3. renders the author username", () => {
        render(<ReviewCard review={baseReview} />);
        expect(screen.getByText("@maya_c")).toBeInTheDocument();
    });

    // 4. Renders title and comment
    it("4. renders title and comment", () => {
        render(<ReviewCard review={baseReview} />);
        expect(screen.getByText("Great recipe")).toBeInTheDocument();
        expect(screen.getByText("Loved making this dish.")).toBeInTheDocument();
    });

    // 5. Renders Foodie badge when author.userRole is "influencer"
    it("5. shows Foodie badge when author.userRole is influencer", () => {
        const review = {
            ...baseReview,
            author: { ...baseReview.author, userRole: "influencer" }
        };
        render(<ReviewCard review={review} />);
        expect(screen.getByText("Foodie")).toBeInTheDocument();
    });

    // 6. No Foodie badge for regular user author
    it("6. does not show Foodie badge when author.userRole is not influencer", () => {
        render(<ReviewCard review={baseReview} />);
        expect(screen.queryByText("Foodie")).not.toBeInTheDocument();
    });

    // 7. Helpful vote button visible for non-owner authenticated user
    it("7. shows helpful vote button for a different user", () => {
        const onHelpful = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={currentUser} onHelpfulVote={onHelpful} />);
        expect(screen.getByRole("button", { name: /mark as helpful/i })).toBeInTheDocument();
    });

    // 8. Helpful vote button hidden for the review owner
    it("8. does not show helpful button for the review owner", () => {
        const onHelpful = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={ownerUser} onHelpfulVote={onHelpful} />);
        expect(screen.queryByRole("button", { name: /helpful/i })).not.toBeInTheDocument();
    });

    // 9. Clicking helpful vote calls onHelpfulVote with reviewId
    it("9. clicking helpful vote calls onHelpfulVote with the reviewId", () => {
        const onHelpful = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={currentUser} onHelpfulVote={onHelpful} />);
        fireEvent.click(screen.getByRole("button", { name: /mark as helpful/i }));
        expect(onHelpful).toHaveBeenCalledWith(10);
    });

    // 10. viewerHasMarkedHelpful toggles aria-pressed and active class
    it("10. helpful button shows aria-pressed=true when viewerHasMarkedHelpful is true", () => {
        const review = { ...baseReview, viewerHasMarkedHelpful: true };
        const onHelpful = jest.fn();
        render(<ReviewCard review={review} currentUser={currentUser} onHelpfulVote={onHelpful} />);
        const btn = screen.getByRole("button", { name: /remove helpful vote/i });
        expect(btn).toHaveAttribute("aria-pressed", "true");
    });

    // 11. Report button visible for non-owner
    it("11. shows Report button for a different user", () => {
        const onReport = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={currentUser} onReport={onReport} />);
        expect(screen.getByRole("button", { name: /report this review/i })).toBeInTheDocument();
    });

    // 12. Report button hidden for review owner
    it("12. does not show Report button for the review owner", () => {
        const onReport = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={ownerUser} onReport={onReport} />);
        expect(screen.queryByRole("button", { name: /report/i })).not.toBeInTheDocument();
    });

    // 13. Clicking Report opens the report modal
    it("13. clicking Report opens the report modal", () => {
        const onReport = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={currentUser} onReport={onReport} />);
        fireEvent.click(screen.getByRole("button", { name: /report this review/i }));
        expect(screen.getByTestId("report-modal")).toBeInTheDocument();
    });

    // 14. Edit and Delete buttons visible for review owner
    it("14. shows Edit and Delete buttons for the review owner", () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={ownerUser} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.getByRole("button", { name: /edit review/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete review/i })).toBeInTheDocument();
    });

    // 15. Admin does NOT get Edit/Delete from the review card (admin uses moderation workflow)
    it("15. does not show Edit/Delete for admin on another user's review", () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={adminUser} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.queryByRole("button", { name: /edit review/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /delete review/i })).not.toBeInTheDocument();
    });

    // 16. Edit and Delete buttons NOT visible for non-owner, non-admin
    it("16. does not show Edit/Delete for non-owner, non-admin", () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={currentUser} onEdit={onEdit} onDelete={onDelete} />);
        expect(screen.queryByRole("button", { name: /edit review/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /delete review/i })).not.toBeInTheDocument();
    });

    // 17. Clicking Edit calls onEdit with the review
    it("17. clicking Edit calls onEdit with the review object", () => {
        const onEdit = jest.fn();
        render(<ReviewCard review={baseReview} currentUser={ownerUser} onEdit={onEdit} onDelete={jest.fn()} />);
        fireEvent.click(screen.getByRole("button", { name: /edit review/i }));
        expect(onEdit).toHaveBeenCalledWith(baseReview);
    });

    // 18. Helpful vote count displayed in "👍 Helpful · N" format
    it("18. displays the helpful vote count in 'Helpful · N' format", () => {
        render(<ReviewCard review={baseReview} />);
        expect(screen.getByText(/Helpful · 3/)).toBeInTheDocument();
    });

    // 19. One submit click sends exactly one report request
    it("19. one submit click sends exactly one report request", async () => {
        const onReport = jest.fn().mockResolvedValue(undefined);
        render(<ReviewCard review={baseReview} currentUser={currentUser} onReport={onReport} />);
        fireEvent.click(screen.getByRole("button", { name: /report this review/i }));
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => expect(onReport).toHaveBeenCalledTimes(1));
    });

    // 20. After a successful report the action changes to ✓ Reported
    it("20. shows ✓ Reported after a successful report", async () => {
        const onReport = jest.fn().mockResolvedValue(undefined);
        render(<ReviewCard review={baseReview} currentUser={currentUser} onReport={onReport} />);
        fireEvent.click(screen.getByRole("button", { name: /report this review/i }));
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => {
            expect(screen.getByText("✓ Reported")).toBeInTheDocument();
        });
        expect(screen.queryByRole("button", { name: /report this review/i })).not.toBeInTheDocument();
    });

    // 21. Submit button is disabled while the request is pending
    it("21. submit button is disabled while loading", async () => {
        // Never resolves — keeps loading=true for the duration of the test
        const onReport = jest.fn().mockReturnValue(new Promise(() => {}));
        render(<ReviewCard review={baseReview} currentUser={currentUser} onReport={onReport} />);
        fireEvent.click(screen.getByRole("button", { name: /report this review/i }));
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => expect(screen.getByText("Submit")).toBeDisabled());
    });

    // 22. 409 is shown as a friendly message and does not re-throw
    it("22. 409 is shown as a friendly submitError and does not throw", async () => {
        const err = Object.assign(new Error("409"), {
            response: { status: 409, data: { error: "Duplicate" } }
        });
        const onReport = jest.fn().mockRejectedValue(err);
        render(<ReviewCard review={baseReview} currentUser={currentUser} onReport={onReport} />);
        fireEvent.click(screen.getByRole("button", { name: /report this review/i }));
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => {
            expect(screen.getByTestId("submit-error")).toHaveTextContent(
                "You have already reported this review."
            );
        });
    });
});
