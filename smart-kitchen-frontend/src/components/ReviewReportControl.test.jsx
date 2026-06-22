import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import * as AuthContext from "../context/AuthContext";
import * as ReviewReportContext from "../context/ReviewReportContext";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

jest.mock("../context/AuthContext");
jest.mock("../context/ReviewReportContext");

import ReviewReportControl from "./ReviewReportControl";

function renderControl({ openCount = 0, role = "admin" } = {}) {
    AuthContext.useAuth.mockReturnValue({
        user: { userId: 2, userRole: role, firstName: "Ellen" }
    });
    ReviewReportContext.useReviewReports.mockReturnValue({
        openCount,
        refreshCount: jest.fn()
    });
    return render(<ReviewReportControl />);
}

describe("ReviewReportControl", () => {
    beforeEach(() => {
        mockNavigate.mockReset();
    });

    // 1. Renders for admin
    it("1. renders the button for admin users", () => {
        renderControl({ openCount: 3 });
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    // 2. Hidden for non-admin
    it("2. does not render for non-admin users", () => {
        renderControl({ openCount: 5, role: "user" });
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    // 3. Badge shows when count > 0
    it("3. shows a badge with the count when openCount > 0", () => {
        renderControl({ openCount: 7 });
        expect(screen.getByText("7")).toBeInTheDocument();
    });

    // 4. No badge when count is 0
    it("4. does not show a badge when openCount is 0", () => {
        renderControl({ openCount: 0 });
        expect(screen.queryByText("0")).not.toBeInTheDocument();
    });

    // 5. Aria-label — singular
    it("5. aria-label uses singular 'report' for count of 1", () => {
        renderControl({ openCount: 1 });
        expect(screen.getByRole("button")).toHaveAttribute("aria-label", "1 open review report");
    });

    // 6. Aria-label — plural
    it("6. aria-label uses plural 'reports' for count > 1", () => {
        renderControl({ openCount: 5 });
        expect(screen.getByRole("button")).toHaveAttribute("aria-label", "5 open review reports");
    });

    // 7. Aria-label at count 0
    it("7. aria-label says '0 open review reports' when count is 0", () => {
        renderControl({ openCount: 0 });
        expect(screen.getByRole("button")).toHaveAttribute("aria-label", "0 open review reports");
    });

    // 8. Clicking navigates to /dashboard#review-reports
    it("8. clicking navigates to /dashboard#review-reports", () => {
        renderControl({ openCount: 2 });
        fireEvent.click(screen.getByRole("button"));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard#review-reports");
    });

    // 9. Clickable when count is 0
    it("9. remains clickable when openCount is 0", () => {
        renderControl({ openCount: 0 });
        fireEvent.click(screen.getByRole("button"));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard#review-reports");
    });
});
