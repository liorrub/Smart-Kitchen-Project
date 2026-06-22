import {
    CATEGORY_DEFAULT_IMAGES,
    GENERAL_DEFAULT_IMAGE,
    getCategoryDefaultImage,
    handleImageError
} from "./recipeImageUtils";
import { resolveImageUrl } from "./apiConfig";

// ── Tests 1–2: resolveImageUrl behavior ────────────────────────────────────

test("valid recipe imageUrl passes through resolveImageUrl unchanged", () => {
    const url = "https://example.com/pasta.jpg";
    expect(resolveImageUrl(url)).toBe(url);
    // The resolved URL is truthy, so it would be preferred over any category default
    expect(resolveImageUrl(url)).not.toBe(getCategoryDefaultImage("dinner"));
});

test("uploaded local image path resolves to the backend base URL", () => {
    expect(resolveImageUrl("/uploads/recipe-42.jpg")).toBe(
        "http://localhost:3000/uploads/recipe-42.jpg"
    );
});

// ── Tests 3–5: getCategoryDefaultImage ────────────────────────────────────

test("missing imageUrl falls back to matching category default URL", () => {
    // resolveImageUrl returns null for falsy input
    expect(resolveImageUrl(null)).toBeNull();
    expect(resolveImageUrl("")).toBeNull();

    // Without an imageUrl the caller falls back to getCategoryDefaultImage
    expect(getCategoryDefaultImage("lunch")).toBe(CATEGORY_DEFAULT_IMAGES.lunch);
    expect(getCategoryDefaultImage("breakfast")).toBe(CATEGORY_DEFAULT_IMAGES.breakfast);
    expect(getCategoryDefaultImage("dinner")).toBe(CATEGORY_DEFAULT_IMAGES.dinner);
    expect(getCategoryDefaultImage("snack")).toBe(CATEGORY_DEFAULT_IMAGES.snack);
});

test("dessert category uses the dedicated dessert default URL", () => {
    expect(getCategoryDefaultImage("dessert")).toBe(CATEGORY_DEFAULT_IMAGES.dessert);
    expect(getCategoryDefaultImage("DESSERT")).toBe(CATEGORY_DEFAULT_IMAGES.dessert);
});

test("missing or unknown category uses the general default URL", () => {
    expect(getCategoryDefaultImage("")).toBe(GENERAL_DEFAULT_IMAGE);
    expect(getCategoryDefaultImage(null)).toBe(GENERAL_DEFAULT_IMAGE);
    expect(getCategoryDefaultImage(undefined)).toBe(GENERAL_DEFAULT_IMAGE);
    expect(getCategoryDefaultImage("salad")).toBe(GENERAL_DEFAULT_IMAGE);
    expect(getCategoryDefaultImage("unknown")).toBe(GENERAL_DEFAULT_IMAGE);
});

// ── Tests 6–8: handleImageError fallback chain ────────────────────────────

test("broken recipe image falls back to the category default", () => {
    const img = document.createElement("img");
    // Initial state (no attribute set) represents the first attempt with recipe imageUrl
    handleImageError({ currentTarget: img }, "dinner");

    expect(img.getAttribute("data-fallback-state")).toBe("category");
    expect(img.getAttribute("src")).toBe(CATEGORY_DEFAULT_IMAGES.dinner);
});

test("broken category default falls back to the general default", () => {
    const img = document.createElement("img");
    img.setAttribute("data-fallback-state", "category");

    handleImageError({ currentTarget: img }, "dinner");

    expect(img.getAttribute("data-fallback-state")).toBe("general");
    expect(img.getAttribute("src")).toBe(GENERAL_DEFAULT_IMAGE);
});

test("fallback process stops (onerror cleared) after the general default fails", () => {
    const img = document.createElement("img");
    img.setAttribute("data-fallback-state", "general");
    img.onerror = () => {};  // set a handler so we can verify it is cleared

    handleImageError({ currentTarget: img }, "dinner");

    expect(img.onerror).toBeNull();
    // src and state are not changed after stopping
    expect(img.getAttribute("data-fallback-state")).toBe("general");
});
