import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as AuthContext from "../context/AuthContext";
import * as PendingRecipeContext from "../context/PendingRecipeContext";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

jest.mock("../context/AuthContext");
jest.mock("../context/PendingRecipeContext");

import AdminReviewControl from "./AdminReviewControl";

function renderControl({ pendingCount = 3, role = "admin" } = {}) {
    AuthContext.useAuth.mockReturnValue({
        user: { userId: 2, userRole: role, firstName: "Ellen" }
    });
    PendingRecipeContext.usePendingRecipes.mockReturnValue({
        pendingCount,
        refreshCount: jest.fn()
    });
    return render(<AdminReviewControl />);
}

describe("AdminReviewControl", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    // 1. Admin sees the icon when count is 0
    it("1. renders for admin when pendingCount is 0", () => {
        renderControl({ pendingCount: 0, role: "admin" });
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    // 2. Badge is hidden when count is 0 (consistent with NotificationBell and ReviewReportControl)
    it("2. badge is not shown when count is 0", () => {
        renderControl({ pendingCount: 0, role: "admin" });
        expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    // 3. Badge displays the correct positive count
    it("3. badge displays the correct positive count", () => {
        renderControl({ pendingCount: 5, role: "admin" });
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    // 4. Accessible label — singular for count of 1
    it("4a. aria-label uses singular 'request' for count of 1", () => {
        renderControl({ pendingCount: 1, role: "admin" });
        expect(screen.getByRole("button")).toHaveAttribute(
            "aria-label",
            "1 pending recipe request"
        );
    });

    // 4b. Accessible label — plural for count > 1
    it("4b. aria-label uses plural 'requests' for count of 5", () => {
        renderControl({ pendingCount: 5, role: "admin" });
        expect(screen.getByRole("button")).toHaveAttribute(
            "aria-label",
            "5 pending recipe requests"
        );
    });

    // 4c. Accessible label — plural for count of 0
    it("4c. aria-label uses plural 'requests' for count of 0", () => {
        renderControl({ pendingCount: 0, role: "admin" });
        expect(screen.getByRole("button")).toHaveAttribute(
            "aria-label",
            "0 pending recipe requests"
        );
    });

    // 5. Clicking navigates to /dashboard#recipe-approvals
    it("5. clicking navigates to /dashboard#recipe-approvals", () => {
        renderControl({ pendingCount: 3 });
        fireEvent.click(screen.getByRole("button"));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard#recipe-approvals");
    });

    // 6. Non-admin users do not see the control
    it("6. does not render for non-admin roles", () => {
        renderControl({ pendingCount: 5, role: "user" });
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    // 7. Full pending text is NOT permanently rendered as visible content
    it("7. full pending count text is not rendered as visible button content", () => {
        renderControl({ pendingCount: 5, role: "admin" });
        expect(screen.queryByText(/pending recipe/i)).not.toBeInTheDocument();
    });

    // 8. Remains clickable when count is 0 — no dedicated text column widens the layout
    it("8. is clickable and navigates when count is 0", () => {
        renderControl({ pendingCount: 0, role: "admin" });
        fireEvent.click(screen.getByRole("button"));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard#recipe-approvals");
    });
});
