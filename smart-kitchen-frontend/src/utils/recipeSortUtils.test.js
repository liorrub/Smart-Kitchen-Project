import { applySort } from "./recipeSortUtils";

// Representative dataset covering all sort fields and edge cases.
// recipeId encodes the "natural" API order — default sort preserves this.
const BASE = [
    {
        recipeId: 1,
        title: "Quick Pasta",
        difficulty: "easy",
        prepTime: 5,
        servings: 2,
        likeCount: 30,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        recipeId: 2,
        title: "Complex Roast",
        difficulty: "hard",
        prepTime: 45,
        servings: 8,
        likeCount: 5,
        createdAt: "2024-06-15T00:00:00.000Z"
    },
    {
        recipeId: 3,
        title: "Medium Curry",
        difficulty: "medium",
        prepTime: 20,
        servings: 4,
        likeCount: 50,
        createdAt: "2024-03-10T00:00:00.000Z"
    },
    {
        recipeId: 4,
        title: "Missing Values",
        difficulty: undefined,
        prepTime: null,
        servings: null,
        likeCount: null,
        createdAt: null
    }
];

function titles(result) {
    return result.map(r => r.title);
}

describe("applySort — preparation time", () => {
    it("prep-asc: shortest prep time first, missing last", () => {
        const result = applySort(BASE, "prep-asc");
        const t = titles(result);
        expect(t[0]).toBe("Quick Pasta");      // 5 min
        expect(t[1]).toBe("Medium Curry");     // 20 min
        expect(t[2]).toBe("Complex Roast");    // 45 min
        expect(t[t.length - 1]).toBe("Missing Values"); // null → last
    });

    it("prep-desc: longest prep time first, missing last", () => {
        const result = applySort(BASE, "prep-desc");
        const t = titles(result);
        expect(t[0]).toBe("Complex Roast");    // 45 min
        expect(t[1]).toBe("Medium Curry");     // 20 min
        expect(t[2]).toBe("Quick Pasta");      // 5 min
        expect(t[t.length - 1]).toBe("Missing Values"); // null → last
    });

    it("prep-asc: sorts numerically, not alphabetically", () => {
        const recipes = [
            { title: "A", prepTime: 100 },
            { title: "B", prepTime: 9 }
        ];
        const result = applySort(recipes, "prep-asc");
        expect(result[0].title).toBe("B"); // 9 < 100 numerically
        expect(result[1].title).toBe("A");
    });
});

describe("applySort — servings", () => {
    it("servings-asc: lowest servings first, missing last", () => {
        const result = applySort(BASE, "servings-asc");
        const t = titles(result);
        expect(t[0]).toBe("Quick Pasta");      // 2
        expect(t[1]).toBe("Medium Curry");     // 4
        expect(t[2]).toBe("Complex Roast");    // 8
        expect(t[t.length - 1]).toBe("Missing Values");
    });

    it("servings-desc: highest servings first, missing last", () => {
        const result = applySort(BASE, "servings-desc");
        const t = titles(result);
        expect(t[0]).toBe("Complex Roast");    // 8
        expect(t[1]).toBe("Medium Curry");     // 4
        expect(t[2]).toBe("Quick Pasta");      // 2
        expect(t[t.length - 1]).toBe("Missing Values");
    });

    it("servings-asc: sorts numerically, not alphabetically", () => {
        const recipes = [
            { title: "A", servings: 10 },
            { title: "B", servings: 8 }
        ];
        const result = applySort(recipes, "servings-asc");
        expect(result[0].title).toBe("B"); // 8 < 10 numerically
    });
});

describe("applySort — difficulty", () => {
    it("difficulty-asc: easy → medium → hard, unknown last", () => {
        const result = applySort(BASE, "difficulty-asc");
        const t = titles(result);
        expect(t[0]).toBe("Quick Pasta");   // easy
        expect(t[1]).toBe("Medium Curry");  // medium
        expect(t[2]).toBe("Complex Roast"); // hard
        expect(t[t.length - 1]).toBe("Missing Values"); // unknown → last
    });

    it("difficulty-desc: hard → medium → easy, unknown last", () => {
        const result = applySort(BASE, "difficulty-desc");
        const t = titles(result);
        expect(t[0]).toBe("Complex Roast"); // hard
        expect(t[1]).toBe("Medium Curry");  // medium
        expect(t[2]).toBe("Quick Pasta");   // easy
        expect(t[t.length - 1]).toBe("Missing Values"); // unknown → last
    });

    it("difficulty order is not alphabetical (hard < medium alphabetically but hard > medium logically)", () => {
        const recipes = [
            { title: "H", difficulty: "hard" },
            { title: "M", difficulty: "medium" },
            { title: "E", difficulty: "easy" }
        ];
        const asc = applySort(recipes, "difficulty-asc");
        expect(asc.map(r => r.title)).toEqual(["E", "M", "H"]);

        const desc = applySort(recipes, "difficulty-desc");
        expect(desc.map(r => r.title)).toEqual(["H", "M", "E"]);
    });
});

describe("applySort — date", () => {
    it("newest: most recent createdAt first, missing last", () => {
        const result = applySort(BASE, "newest");
        const t = titles(result);
        expect(t[0]).toBe("Complex Roast");  // 2024-06-15
        expect(t[1]).toBe("Medium Curry");   // 2024-03-10
        expect(t[2]).toBe("Quick Pasta");    // 2024-01-01
        expect(t[t.length - 1]).toBe("Missing Values");
    });

    it("oldest: earliest createdAt first, missing last", () => {
        const result = applySort(BASE, "oldest");
        const t = titles(result);
        expect(t[0]).toBe("Quick Pasta");    // 2024-01-01
        expect(t[1]).toBe("Medium Curry");   // 2024-03-10
        expect(t[2]).toBe("Complex Roast");  // 2024-06-15
        expect(t[t.length - 1]).toBe("Missing Values");
    });
});

describe("applySort — likes", () => {
    it("likes-desc: most liked first, null treated as 0", () => {
        const result = applySort(BASE, "likes-desc");
        const t = titles(result);
        expect(t[0]).toBe("Medium Curry");   // 50
        expect(t[1]).toBe("Quick Pasta");    // 30
        expect(t[2]).toBe("Complex Roast");  // 5
        // Missing Values has likeCount: null → treated as 0, ends up last
        expect(t[t.length - 1]).toBe("Missing Values");
    });

    it("likes-desc: uses the likeCount field from the recipe object (no separate request)", () => {
        // This test verifies the sort reads likeCount from the already-loaded recipe data.
        // It would fail if we tried to access a property not present on the object.
        const recipesWithLikes = [
            { title: "A", likeCount: 10 },
            { title: "B", likeCount: 99 }
        ];
        const result = applySort(recipesWithLikes, "likes-desc");
        expect(result[0].title).toBe("B");
        expect(result[1].title).toBe("A");
    });
});

describe("applySort — default sort", () => {
    it("default: preserves the original input order", () => {
        const result = applySort(BASE, "default");
        expect(titles(result)).toEqual(titles(BASE));
    });

    it("unknown sort key: preserves the original input order", () => {
        const result = applySort(BASE, "not-a-valid-key");
        expect(titles(result)).toEqual(titles(BASE));
    });
});

describe("applySort — immutability", () => {
    it("does not mutate the input array", () => {
        const input = [
            { title: "Z", prepTime: 60 },
            { title: "A", prepTime: 1 }
        ];
        const frozen = Object.freeze([...input]);
        const copy = [...input];
        expect(() => applySort(frozen, "prep-asc")).not.toThrow();
        expect(input[0].title).toBe("Z"); // original unchanged
        expect(copy[0].title).toBe("Z");
    });

    it("returns a new array, not the input reference", () => {
        const input = [{ title: "A" }];
        const result = applySort(input, "default");
        expect(result).not.toBe(input);
    });
});

describe("applySort — filter + sort interaction", () => {
    it("sorting a pre-filtered subset produces the correct order (simulates category filter + sort)", () => {
        const allRecipes = [
            { title: "Fast Dinner",    category: "dinner",    prepTime: 5  },
            { title: "Slow Dinner",    category: "dinner",    prepTime: 60 },
            { title: "Quick Breakfast",category: "breakfast", prepTime: 3  }
        ];
        // Simulate applying a "dinner" category filter then sorting by prep-asc
        const filtered = allRecipes.filter(r => r.category === "dinner");
        const sorted = applySort(filtered, "prep-asc");
        expect(sorted).toHaveLength(2);
        expect(sorted[0].title).toBe("Fast Dinner");    // 5 min
        expect(sorted[1].title).toBe("Slow Dinner");    // 60 min
        // The breakfast recipe must not appear in the result
        expect(sorted.some(r => r.title === "Quick Breakfast")).toBe(false);
    });
});

describe("applySort — missing values are always last", () => {
    it("null prepTime is last in both ascending and descending", () => {
        const recipes = [
            { title: "HasPrep", prepTime: 10 },
            { title: "NoPrep", prepTime: null }
        ];
        const asc = applySort(recipes, "prep-asc");
        expect(asc[asc.length - 1].title).toBe("NoPrep");

        const desc = applySort(recipes, "prep-desc");
        expect(desc[desc.length - 1].title).toBe("NoPrep");
    });

    it("null servings is last in both ascending and descending", () => {
        const recipes = [
            { title: "HasServings", servings: 4 },
            { title: "NoServings", servings: null }
        ];
        const asc = applySort(recipes, "servings-asc");
        expect(asc[asc.length - 1].title).toBe("NoServings");

        const desc = applySort(recipes, "servings-desc");
        expect(desc[desc.length - 1].title).toBe("NoServings");
    });

    it("null/undefined difficulty is last in both directions", () => {
        const recipes = [
            { title: "Easy", difficulty: "easy" },
            { title: "Unknown", difficulty: undefined }
        ];
        const asc = applySort(recipes, "difficulty-asc");
        expect(asc[asc.length - 1].title).toBe("Unknown");

        const desc = applySort(recipes, "difficulty-desc");
        expect(desc[desc.length - 1].title).toBe("Unknown");
    });

    it("null createdAt is last in newest and oldest sorts", () => {
        const recipes = [
            { title: "Has Date", createdAt: "2024-01-01T00:00:00.000Z" },
            { title: "No Date", createdAt: null }
        ];
        const newest = applySort(recipes, "newest");
        expect(newest[newest.length - 1].title).toBe("No Date");

        const oldest = applySort(recipes, "oldest");
        expect(oldest[oldest.length - 1].title).toBe("No Date");
    });
});
