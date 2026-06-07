export function validateIngredientForm(ingredientData) {
    const name = ingredientData.name.trim();
    const category = ingredientData.category.trim();

    if (!name) {
        return "Ingredient name is required.";
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

function isValidIngredientText(value) {
    const text = value.trim();

    const validPattern =
        /^[A-Za-zא-ת\s-]+$/;

    return (
        text.length >= 2 &&
        validPattern.test(text)
    );
}