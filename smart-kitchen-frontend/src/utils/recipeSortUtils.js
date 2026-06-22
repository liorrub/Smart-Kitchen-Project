// Explicit difficulty ranking: easy < medium < hard.
// Unknown/missing values are sorted last by mapping to 999.
const DIFFICULTY_ORDER = { easy: 0, medium: 1, hard: 2 };

/**
 * Return a sorted copy of `recipes` according to `sortBy`.
 * The input array is never mutated — a new array is always returned.
 *
 * Missing values are placed last regardless of sort direction.
 */
export function applySort(recipes, sortBy) {
    const sorted = [...recipes];

    switch (sortBy) {
        case "newest":
            sorted.sort((a, b) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            break;

        case "oldest":
            sorted.sort((a, b) => {
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
            break;

        case "prep-asc":
            sorted.sort((a, b) => {
                const aV = a.prepTime ?? Infinity;
                const bV = b.prepTime ?? Infinity;
                return aV - bV;
            });
            break;

        case "prep-desc":
            sorted.sort((a, b) => {
                if (a.prepTime == null && b.prepTime == null) return 0;
                if (a.prepTime == null) return 1;
                if (b.prepTime == null) return -1;
                return b.prepTime - a.prepTime;
            });
            break;

        case "servings-asc":
            sorted.sort((a, b) => {
                const aV = a.servings ?? Infinity;
                const bV = b.servings ?? Infinity;
                return aV - bV;
            });
            break;

        case "servings-desc":
            sorted.sort((a, b) => {
                if (a.servings == null && b.servings == null) return 0;
                if (a.servings == null) return 1;
                if (b.servings == null) return -1;
                return b.servings - a.servings;
            });
            break;

        case "difficulty-asc":
            sorted.sort((a, b) => {
                const aV = DIFFICULTY_ORDER[a.difficulty] ?? 999;
                const bV = DIFFICULTY_ORDER[b.difficulty] ?? 999;
                return aV - bV;
            });
            break;

        case "difficulty-desc":
            sorted.sort((a, b) => {
                const aKnown = a.difficulty in DIFFICULTY_ORDER;
                const bKnown = b.difficulty in DIFFICULTY_ORDER;
                if (!aKnown && !bKnown) return 0;
                if (!aKnown) return 1;   // unknown → last
                if (!bKnown) return -1;  // unknown → last
                return DIFFICULTY_ORDER[b.difficulty] - DIFFICULTY_ORDER[a.difficulty];
            });
            break;

        case "likes-desc":
            sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
            break;

        default:
            // "default" / unknown key: preserve original API order
            break;
    }

    return sorted;
}
