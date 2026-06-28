// Share a recipe using the Web Share API when available, falling back to clipboard.
// Returns: 'shared' | 'copied' | 'cancelled' | 'error'
export async function shareRecipe(recipe) {
    const url = `${window.location.origin}/recipes/${recipe.recipeId}`;
    const shareData = {
        title: recipe.title,
        text: `Check out this recipe on Smart Kitchen: ${recipe.title}`,
        url
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return "shared";
        } catch (err) {
            // AbortError = user dismissed the native dialog — not an error
            if (err.name === "AbortError") return "cancelled";
            return "error";
        }
    }

    // Clipboard fallback
    try {
        await navigator.clipboard.writeText(url);
        return "copied";
    } catch {
        return "error";
    }
}
