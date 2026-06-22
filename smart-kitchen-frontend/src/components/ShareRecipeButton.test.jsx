import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("../utils/shareUtils", () => ({
    shareRecipe: jest.fn()
}));

import ShareRecipeButton from "./ShareRecipeButton";
import { shareRecipe } from "../utils/shareUtils";

const MOCK_RECIPE = { recipeId: 101, title: "Creamy Pasta" };

function renderBtn(props = {}) {
    return render(<ShareRecipeButton recipe={MOCK_RECIPE} {...props} />);
}

describe("ShareRecipeButton", () => {
    beforeEach(() => {
        shareRecipe.mockReset();
    });

    it("renders a share button", () => {
        renderBtn();
        expect(screen.getByRole("button", { name: /share recipe/i })).toBeInTheDocument();
    });

    it("shows 'Recipe link copied!' when result is 'copied'", async () => {
        shareRecipe.mockResolvedValue("copied");
        renderBtn();
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /share recipe/i }));
        });
        expect(screen.getByText(/recipe link copied/i)).toBeInTheDocument();
    });

    it("shows an error message when result is 'error'", async () => {
        shareRecipe.mockResolvedValue("error");
        renderBtn();
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /share recipe/i }));
        });
        expect(screen.getByText(/could not copy link/i)).toBeInTheDocument();
    });

    it("shows no feedback when result is 'shared'", async () => {
        shareRecipe.mockResolvedValue("shared");
        renderBtn();
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /share recipe/i }));
        });
        expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/could not/i)).not.toBeInTheDocument();
    });

    it("shows no error when result is 'cancelled'", async () => {
        shareRecipe.mockResolvedValue("cancelled");
        renderBtn();
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /share recipe/i }));
        });
        expect(screen.queryByText(/could not/i)).not.toBeInTheDocument();
    });

    it("calls the onClick prop before sharing (for stopPropagation)", async () => {
        shareRecipe.mockResolvedValue("shared");
        const onClick = jest.fn();
        renderBtn({ onClick });
        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /share recipe/i }));
        });
        expect(onClick).toHaveBeenCalled();
    });
});
