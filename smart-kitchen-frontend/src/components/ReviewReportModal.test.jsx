import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("./CustomSelect", () => function MockCustomSelect({ name, onChange }) {
    return (
        <button
            type="button"
            data-testid={`select-${name}`}
            onClick={() => onChange({ target: { name, value: "spam" } })}
        >
            Select spam
        </button>
    );
});

import ReviewReportModal from "./ReviewReportModal";

function renderModal(props = {}) {
    const defaults = {
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        loading: false,
        submitError: "",
        submitSuccess: false
    };
    return render(<ReviewReportModal {...defaults} {...props} />);
}

function selectReason() {
    fireEvent.click(screen.getByTestId("select-reason"));
}

describe("ReviewReportModal — submission guard", () => {
    // 1. One click sends exactly one report request
    it("1. one click sends exactly one report request", () => {
        const onSubmit = jest.fn();
        renderModal({ onSubmit });
        selectReason();
        fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // 2. Rapid double-click still sends only one request
    it("2. rapid double-click sends only one request", () => {
        const onSubmit = jest.fn();
        renderModal({ onSubmit });
        selectReason();
        const submitBtn = screen.getByRole("button", { name: /submit report/i });
        fireEvent.click(submitBtn);
        fireEvent.click(submitBtn);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // 3. A successful request: loading stays true after submit — no second call is possible
    it("3. submit is blocked after first call (prevents a later 409)", () => {
        const onSubmit = jest.fn();
        const { rerender } = renderModal({ onSubmit });
        selectReason();
        fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
        // Simulate parent setting loading=true after the request starts
        rerender(
            <ReviewReportModal
                onSubmit={onSubmit}
                onClose={jest.fn()}
                loading={true}
                submitError=""
                submitSuccess={false}
            />
        );
        const btn = screen.getByRole("button", { name: /submitting/i });
        expect(btn).toBeDisabled();
        fireEvent.click(btn);
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    // 4. Submit is disabled while loading=true
    it("4. submit button is disabled while loading", () => {
        renderModal({ loading: true });
        expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();
    });

    // 5. 409 is displayed as a friendly message via submitError prop (no runtime overlay)
    it("5. 409 displayed as a friendly alert message", () => {
        renderModal({ submitError: "You have already reported this review." });
        expect(screen.getByRole("alert")).toHaveTextContent(
            "You have already reported this review."
        );
    });

    // 6. submitSuccess shows the thank-you message instead of the form
    it("6. submitSuccess shows thank-you message", () => {
        renderModal({ submitSuccess: true });
        expect(screen.getByRole("status")).toHaveTextContent(
            "Thank you. The review was reported for admin review."
        );
        expect(screen.queryByRole("button", { name: /submit report/i })).not.toBeInTheDocument();
    });

    // 7. Without selecting a reason, submit shows a validation error and does not call onSubmit
    it("7. shows validation error when no reason selected", () => {
        const onSubmit = jest.fn();
        renderModal({ onSubmit });
        fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
        expect(screen.getByRole("alert")).toHaveTextContent("Please select a reason");
        expect(onSubmit).not.toHaveBeenCalled();
    });

    // 8. Error recovery: after failure (loading goes false), the user can resubmit
    it("8. user can resubmit after an error (loading resets to false)", () => {
        const onSubmit = jest.fn();
        const { rerender } = renderModal({ onSubmit, loading: true });
        // Simulate error recovery: parent sets loading back to false
        rerender(
            <ReviewReportModal
                onSubmit={onSubmit}
                onClose={jest.fn()}
                loading={false}
                submitError="Failed to submit the report. Please try again."
                submitSuccess={false}
            />
        );
        selectReason();
        fireEvent.click(screen.getByRole("button", { name: /submit report/i }));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
