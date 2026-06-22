import { shareRecipe } from "./shareUtils";

const MOCK_RECIPE = {
    recipeId: 101,
    title: "Creamy Pasta"
};

// Save and restore original navigator properties
let originalShare;
let originalClipboard;

beforeEach(() => {
    originalShare = navigator.share;
    originalClipboard = navigator.clipboard;

    // Reset window.location.origin (jsdom sets it)
    Object.defineProperty(window, "location", {
        value: { ...window.location, origin: "http://localhost:5173" },
        writable: true
    });
});

afterEach(() => {
    Object.defineProperty(navigator, "share", {
        value: originalShare,
        writable: true,
        configurable: true
    });
    Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        writable: true,
        configurable: true
    });
});

function mockShare(impl) {
    Object.defineProperty(navigator, "share", {
        value: impl,
        writable: true,
        configurable: true
    });
}

function mockClipboard(impl) {
    Object.defineProperty(navigator, "clipboard", {
        value: { writeText: impl },
        writable: true,
        configurable: true
    });
}

describe("shareUtils", () => {
    it("uses Web Share API when navigator.share is available", async () => {
        const mockShareFn = jest.fn().mockResolvedValue(undefined);
        mockShare(mockShareFn);

        const result = await shareRecipe(MOCK_RECIPE);
        expect(mockShareFn).toHaveBeenCalled();
        expect(result).toBe("shared");
    });

    it("includes the correct absolute recipe URL in the share payload", async () => {
        const mockShareFn = jest.fn().mockResolvedValue(undefined);
        mockShare(mockShareFn);

        await shareRecipe(MOCK_RECIPE);
        expect(mockShareFn).toHaveBeenCalledWith(
            expect.objectContaining({
                url: "http://localhost:5173/recipes/101"
            })
        );
    });

    it("returns 'cancelled' when user dismisses native share dialog", async () => {
        mockShare(() => { throw Object.assign(new Error("AbortError"), { name: "AbortError" }); });

        const result = await shareRecipe(MOCK_RECIPE);
        expect(result).toBe("cancelled");
    });

    it("returns 'error' when share throws a non-abort error", async () => {
        mockShare(() => { throw new Error("NotSupportedError"); });

        const result = await shareRecipe(MOCK_RECIPE);
        expect(result).toBe("error");
    });

    it("falls back to clipboard when navigator.share is undefined", async () => {
        mockShare(undefined);
        const writeText = jest.fn().mockResolvedValue(undefined);
        mockClipboard(writeText);

        const result = await shareRecipe(MOCK_RECIPE);
        expect(writeText).toHaveBeenCalledWith("http://localhost:5173/recipes/101");
        expect(result).toBe("copied");
    });

    it("returns 'error' when clipboard.writeText fails", async () => {
        mockShare(undefined);
        mockClipboard(() => { throw new Error("Clipboard not available"); });

        const result = await shareRecipe(MOCK_RECIPE);
        expect(result).toBe("error");
    });

    it("produces a URL with the numeric recipe ID (not undefined)", async () => {
        mockShare(undefined);
        const writeText = jest.fn().mockResolvedValue(undefined);
        mockClipboard(writeText);

        await shareRecipe(MOCK_RECIPE);
        const [writtenUrl] = writeText.mock.calls[0];
        expect(writtenUrl).toMatch(/\/recipes\/101$/);
        expect(writtenUrl).not.toContain("undefined");
    });

    it("does not add tracking parameters to the URL", async () => {
        mockShare(undefined);
        const writeText = jest.fn().mockResolvedValue(undefined);
        mockClipboard(writeText);

        await shareRecipe(MOCK_RECIPE);
        const [writtenUrl] = writeText.mock.calls[0];
        expect(writtenUrl).not.toContain("?");
        expect(writtenUrl).not.toContain("utm_");
    });
});
