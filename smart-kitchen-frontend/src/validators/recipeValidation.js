export function validateRecipeForm(recipeData) {
    const title = recipeData.title.trim();
    const cuisine = recipeData.cuisine;
    const instructionSteps = recipeData.instructionSteps;
    const ingredients = recipeData.ingredients;

    const prepTime = Number(recipeData.prepTime);
    const cookTime = Number(recipeData.cookTime);
    const servings = Number(recipeData.servings);
    const calories = Number(recipeData.calories);

    if (!title) {
        return "Recipe title is required.";
    }

    if (!isValidRecipeText(title)) {
        return "Recipe title must contain only letters, numbers, spaces or hyphen, and be at least 2 characters long.";
    }

    if (!cuisine) {
        return "Cuisine is required.";
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return "At least one ingredient is required.";
    }

    // Validate that there is at least one non-empty instruction step
    const filledSteps = Array.isArray(instructionSteps)
        ? instructionSteps.filter((step) => step.trim())
        : [];

    if (filledSteps.length === 0) {
        return "At least one instruction step is required.";
    }

    if (Number.isNaN(prepTime) || prepTime < 0) {
        return "Prep time must be a valid number.";
    }

    if (Number.isNaN(cookTime) || cookTime < 0) {
        return "Cook time must be a valid number.";
    }

    if (Number.isNaN(servings) || servings <= 0) {
        return "Servings must be greater than 0.";
    }

    if (Number.isNaN(calories) || calories <= 0) {
        return "Calories must be greater than 0.";
    }

    return "";
}

function isValidRecipeText(value) {
    const text = value.trim();

    const validPattern = /^[A-Za-zא-ת0-9\s-]+$/;

    return (
        text.length >= 2 &&
        validPattern.test(text)
    );
}
