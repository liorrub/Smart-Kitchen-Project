import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import StarRating from "./StarRating";

describe("StarRating", () => {
    // 1. Renders 5 star buttons
    it("1. renders exactly 5 star buttons", () => {
        render(<StarRating value={0} onChange={jest.fn()} />);
        const buttons = screen.getAllByRole("button");
        expect(buttons).toHaveLength(5);
    });

    // 2. Filled stars match the value prop
    it("2. marks the correct number of stars as filled for value=3", () => {
        render(<StarRating value={3} onChange={jest.fn()} />);
        const filled = document.querySelectorAll(".star-rating-star--filled");
        expect(filled).toHaveLength(3);
    });

    // 3. Clicking a star calls onChange with the correct value
    it("3. clicking the 4th star calls onChange with 4", () => {
        const onChange = jest.fn();
        render(<StarRating value={0} onChange={onChange} />);
        fireEvent.click(screen.getByRole("button", { name: "4 stars" }));
        expect(onChange).toHaveBeenCalledWith(4);
    });

    // 4. readOnly disables all buttons
    it("4. star buttons are disabled when readOnly is true", () => {
        render(<StarRating value={3} readOnly />);
        screen.getAllByRole("button").forEach((btn) => {
            expect(btn).toBeDisabled();
        });
    });

    // 5. No onChange call in readOnly mode
    it("5. does not call onChange when readOnly is true", () => {
        const onChange = jest.fn();
        render(<StarRating value={2} readOnly onChange={onChange} />);
        fireEvent.click(screen.getAllByRole("button")[0]);
        expect(onChange).not.toHaveBeenCalled();
    });

    // 6. value=0 — no filled stars
    it("6. shows no filled stars when value is 0", () => {
        render(<StarRating value={0} onChange={jest.fn()} />);
        const filled = document.querySelectorAll(".star-rating-star--filled");
        expect(filled).toHaveLength(0);
    });

    // 7. value=5 — all filled
    it("7. marks all 5 stars filled when value is 5", () => {
        render(<StarRating value={5} onChange={jest.fn()} />);
        const filled = document.querySelectorAll(".star-rating-star--filled");
        expect(filled).toHaveLength(5);
    });
});
