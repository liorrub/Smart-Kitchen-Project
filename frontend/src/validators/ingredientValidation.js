import { TEXT_LIMITS } from "../constants/textLimits";

// Validate the ingredient create/edit form. Returns an error message string or an empty string if valid.
export function validateIngredientForm(ingredientData) {
    const name = ingredientData.name.trim();
    const category = ingredientData.category.trim();

    if (!name) {
        return "Ingredient name is required.";
    }

    if (name.length > TEXT_LIMITS.ingredientName) {
        return `Ingredient name must be at most ${TEXT_LIMITS.ingredientName} characters.`;
    }

    if (!isValidIngredientText(name)) {
        return "Ingredient name must contain only letters, spaces or hyphen, and be at least 2 characters long.";
    }

    if (!category) {
        return "Ingredient category is required.";
    }

    if (!isValidIngredientText(category)) {
        return "Ingredient category must contain only letters, spaces or hyphen, and be at least 2 characters long.";
    }

    return "";
}

// Hebrew characters (א-ת) are allowed because ingredient names may be in Hebrew.
function isValidIngredientText(value) {
    const text = value.trim();

    const validPattern =
        /^[A-Za-zא-ת\s-]+$/;

    return (
        text.length >= 2 &&
        validPattern.test(text)
    );
}