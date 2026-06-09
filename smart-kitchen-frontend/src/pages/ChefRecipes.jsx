import "./Recipes.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";
import AppButton from "../components/AppButton";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import CustomSelect from "../components/CustomSelect";
import CheckboxGroup from "../components/CheckboxGroup";

import {
    getAllRecipes,
    createRecipe,
    deleteRecipe
} from "../services/recipeService";

import { getIngredients } from "../services/ingredientsService";
import { getOptions } from "../services/optionsService";
import { validateRecipeForm } from "../validators/recipeValidation";

// Default empty state for the create recipe form
const EMPTY_RECIPE_FORM_DATA = {
    title: "",
    category: "dinner",
    cuisine: "italian",
    difficulty: "easy",
    prepTime: "",
    cookTime: "",
    servings: "",
    calories: "",
    tags: [],
    ingredients: [],
    selectedIngredientId: "",
    ingredientQuantity: "",
    ingredientUnit: "",
    // Instructions are stored as an array of step strings in the form.
    // Before sending to the backend they are joined into one string.
    instructionSteps: [""]
};

// Capitalize the first letter of a string (used for dropdown labels)
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

// Extract a human-readable error message from an API error response
function getErrorMessage(error, fallbackMessage) {
    const responseData = error.response?.data;

    if (typeof responseData?.error?.message === "string") {
        return responseData.error.message;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
}

function ChefRecipes() {
    const navigate = useNavigate();

    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    const [recipes, setRecipes] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [recipeFormData, setRecipeFormData] = useState(EMPTY_RECIPE_FORM_DATA);
    const [savingRecipe, setSavingRecipe] = useState(false);

    // Options are fetched from the backend so they stay in sync with the enums
    const [options, setOptions] = useState({
        recipes: { cuisines: [], categories: [], difficulties: [], tags: [] },
        pantry: { units: [] }
    });

    const storedUser = getStoredUser();

    // -----------------------------------------------------------------------
    // Load data on mount
    // -----------------------------------------------------------------------

    useEffect(() => {
        async function loadChefRecipes() {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                // Fetch recipes, ingredients and dropdown options in parallel
                const [recipesData, ingredientsData, optionsData] = await Promise.all([
                    getAllRecipes(),
                    getIngredients(),
                    getOptions()
                ]);

                setRecipes(recipesData);
                setIngredients(ingredientsData);
                setOptions(optionsData);

            } catch (err) {
                console.error("Chef recipes loading error:", err);

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load your recipes."
                    )
                );
            } finally {
                setLoading(false);
            }
        }

        loadChefRecipes();
    }, []);

    // Lock page scroll while the create recipe modal is open
    useEffect(() => {
        document.body.style.overflow = isCreateModalOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isCreateModalOpen]);

    // -----------------------------------------------------------------------
    // Derived data
    // -----------------------------------------------------------------------

    // Only show recipes that belong to the logged-in chef
    const chefRecipes = useMemo(() => {
        return recipes.filter((recipe) => {
            return String(recipe.creatorId) === String(storedUser?.userId);
        });
    }, [recipes, storedUser?.userId]);

    // Build ingredient options for the ingredient selector dropdown
    const ingredientOptions = ingredients.map((ingredient) => ({
        value: ingredient.ingredientId,
        label: ingredient.name
    }));

    // -----------------------------------------------------------------------
    // Form field handlers
    // -----------------------------------------------------------------------

    // Generic handler for simple text/number/select fields
    function handleRecipeFormChange(event) {
        const { name, value } = event.target;

        setRecipeFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    }

    // Add a new empty instruction step to the list
    function handleAddStep() {
        setRecipeFormData((previousData) => ({
            ...previousData,
            instructionSteps: [...previousData.instructionSteps, ""]
        }));
    }

    // Update the text of a specific instruction step by index
    function handleStepChange(index, value) {
        setRecipeFormData((previousData) => {
            const newSteps = [...previousData.instructionSteps];
            newSteps[index] = value;
            return { ...previousData, instructionSteps: newSteps };
        });
    }

    // Remove a specific instruction step by index (only when more than one step exists)
    function handleRemoveStep(index) {
        setRecipeFormData((previousData) => ({
            ...previousData,
            instructionSteps: previousData.instructionSteps.filter(
                (_, i) => i !== index
            )
        }));
    }

    // Add an ingredient to the recipe ingredient list
    function handleAddRecipeIngredient() {
        const ingredientId = recipeFormData.selectedIngredientId;
        const quantity = Number(recipeFormData.ingredientQuantity);
        const unit = recipeFormData.ingredientUnit;

        if (!ingredientId || Number.isNaN(quantity) || quantity <= 0 || !unit) {
            setError("Please choose an ingredient, quantity and unit.");
            return;
        }

        const selectedIngredient = ingredients.find(
            (ingredient) =>
                String(ingredient.ingredientId) === String(ingredientId)
        );

        if (!selectedIngredient) {
            setError("Selected ingredient was not found.");
            return;
        }

        const alreadyExists = recipeFormData.ingredients.some(
            (ingredient) =>
                String(ingredient.ingredientId) === String(ingredientId)
        );

        if (alreadyExists) {
            setError("This ingredient was already added to the recipe.");
            return;
        }

        setRecipeFormData((previousData) => ({
            ...previousData,
            ingredients: [
                ...previousData.ingredients,
                {
                    ingredientId: selectedIngredient.ingredientId,
                    name: selectedIngredient.name,
                    quantity: quantity,
                    unit: unit
                }
            ],
            selectedIngredientId: "",
            ingredientQuantity: "",
            ingredientUnit: ""
        }));

        setError("");
    }

    // Remove an ingredient from the recipe ingredient list
    function handleRemoveRecipeIngredient(ingredientId) {
        setRecipeFormData((previousData) => ({
            ...previousData,
            ingredients: previousData.ingredients.filter(
                (ingredient) =>
                    String(ingredient.ingredientId) !== String(ingredientId)
            )
        }));
    }

    // Toggle a tag on or off
    function handleRecipeTagChange(tag) {
        setRecipeFormData((previousData) => {
            const currentTags = previousData.tags;

            return {
                ...previousData,
                tags: currentTags.includes(tag)
                    ? currentTags.filter((currentTag) => currentTag !== tag)
                    : [...currentTags, tag]
            };
        });
    }

    // -----------------------------------------------------------------------
    // Modal open / close
    // -----------------------------------------------------------------------

    function openCreateRecipeModal() {
        setError("");
        setSuccess("");
        setRecipeFormData(EMPTY_RECIPE_FORM_DATA);
        setIsCreateModalOpen(true);
    }

    function closeCreateRecipeModal() {
        setIsCreateModalOpen(false);
        setRecipeFormData(EMPTY_RECIPE_FORM_DATA);
        setError("");
    }

    // -----------------------------------------------------------------------
    // Recipe actions
    // -----------------------------------------------------------------------

    async function handleDeleteRecipe(recipe) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${recipe.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");
            await deleteRecipe(recipe.recipeId, storedUser);

            setRecipes((previousRecipes) =>
                previousRecipes.filter(
                    (currentRecipe) =>
                        currentRecipe.recipeId !== recipe.recipeId
                )
            );

            setSuccess("Recipe deleted successfully.");
        } catch (err) {
            console.error("Delete recipe error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to delete recipe."
                )
            );
        }
    }

    async function handleCreateRecipe(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationMessage = validateRecipeForm(recipeFormData);

        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        const prepTime = Number(recipeFormData.prepTime);
        const cookTime = Number(recipeFormData.cookTime);
        const servings = Number(recipeFormData.servings);
        const calories = Number(recipeFormData.calories);

        // Convert the instruction steps array into one string for the backend.
        // Example: ["Boil water", "Add pasta"] => "Boil water, Add pasta"
        const instructions = recipeFormData.instructionSteps
            .map((step) => step.trim())
            .filter(Boolean)
            .join(", ");

        const newRecipe = {
            title: recipeFormData.title.trim(),
            category: recipeFormData.category,
            cuisine: recipeFormData.cuisine,
            difficulty: recipeFormData.difficulty,
            prepTime,
            cookTime,
            totalTime: prepTime + cookTime,
            servings,
            calories,
            instructions,
            creatorId: storedUser.userId,
            tags: recipeFormData.tags,
            ingredients: recipeFormData.ingredients
        };

        try {
            setSavingRecipe(true);
            await createRecipe(newRecipe, storedUser);

            // Reload the full list so the new recipe appears
            const recipesData = await getAllRecipes();
            setRecipes(recipesData);

            setSuccess("Recipe created successfully.");
            closeCreateRecipeModal();
        } catch (err) {
            console.error("Create recipe error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to create recipe."
                )
            );
        } finally {
            setSavingRecipe(false);
        }
    }

    // -----------------------------------------------------------------------
    // Loading state
    // -----------------------------------------------------------------------

    if (loading) {
        return (
            <div className="recipes-page">
                <div className="recipes-message-card">
                    <h1>Loading your recipes...</h1>

                    <p>
                        Please wait while we load the recipes you created.
                    </p>
                </div>
            </div>
        );
    }

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    return (
        <div className="recipes-page">
            {/* Global success / error modals */}
            <MessageModal
                type="success"
                title="Success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
                title="My Recipes Error"
                message={error}
                onClose={() => setError("")}
            />

            {/* Recipe details modal (read-only view) */}
            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />

            {/* ----------------------------------------------------------------
                Create recipe modal
            ---------------------------------------------------------------- */}
            {isCreateModalOpen && (
                <div
                    className="recipe-modal-overlay recipe-management-modal-overlay"
                    onClick={closeCreateRecipeModal}
                >
                    {/* recipe-management-modal keeps the close button outside the
                        scrollable area so it stays visible at all times */}
                    <div
                        className="recipe-modal recipe-management-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="recipe-modal-close"
                            onClick={closeCreateRecipeModal}
                            aria-label="Close recipe modal"
                        >
                            ×
                        </button>

                        {/* Only this inner div scrolls */}
                        <div className="recipe-management-modal-body">
                            <FormCard
                                label="Create recipe"
                                title="Add New Recipe"
                                description="Fill in the recipe details. The recipe will be connected to your chef account."
                                className="recipe-form-card"
                                actions={
                                    <>
                                        <AppButton
                                            type="submit"
                                            form="recipe-form"
                                            disabled={savingRecipe}
                                        >
                                            {savingRecipe ? "Saving..." : "Add Recipe"}
                                        </AppButton>

                                        <AppButton
                                            type="button"
                                            variant="secondary"
                                            onClick={closeCreateRecipeModal}
                                        >
                                            Cancel
                                        </AppButton>
                                    </>
                                }
                            >
                                <form
                                    id="recipe-form"
                                    onSubmit={handleCreateRecipe}
                                >
                                    <div className="recipe-form-grid">
                                        {/* Basic info */}
                                        <FormField
                                            label="Title"
                                            type="text"
                                            name="title"
                                            value={recipeFormData.title}
                                            onChange={handleRecipeFormChange}
                                            placeholder="Enter recipe title"
                                        />

                                        <CustomSelect
                                            label="Category"
                                            name="category"
                                            value={recipeFormData.category}
                                            onChange={handleRecipeFormChange}
                                            options={options.recipes.categories.map(c => ({ value: c, label: capitalize(c) }))}
                                        />

                                        <CustomSelect
                                            label="Cuisine"
                                            name="cuisine"
                                            value={recipeFormData.cuisine}
                                            onChange={handleRecipeFormChange}
                                            options={options.recipes.cuisines.map(c => ({ value: c, label: capitalize(c) }))}
                                        />

                                        <CustomSelect
                                            label="Difficulty"
                                            name="difficulty"
                                            value={recipeFormData.difficulty}
                                            onChange={handleRecipeFormChange}
                                            options={options.recipes.difficulties.map(d => ({ value: d, label: capitalize(d) }))}
                                        />

                                        {/* Timing and nutrition */}
                                        <FormField
                                            label="Prep Time"
                                            type="number"
                                            name="prepTime"
                                            value={recipeFormData.prepTime}
                                            onChange={handleRecipeFormChange}
                                            placeholder="Minutes"
                                            min="0"
                                        />

                                        <FormField
                                            label="Cook Time"
                                            type="number"
                                            name="cookTime"
                                            value={recipeFormData.cookTime}
                                            onChange={handleRecipeFormChange}
                                            placeholder="Minutes"
                                            min="0"
                                        />

                                        <FormField
                                            label="Servings"
                                            type="number"
                                            name="servings"
                                            value={recipeFormData.servings}
                                            onChange={handleRecipeFormChange}
                                            placeholder="Number of servings"
                                            min="1"
                                        />

                                        <FormField
                                            label="Calories"
                                            type="number"
                                            name="calories"
                                            value={recipeFormData.calories}
                                            onChange={handleRecipeFormChange}
                                            placeholder="Calories"
                                            min="1"
                                        />

                                        {/* Tags — multi-select checkboxes from backend options */}
                                        <CheckboxGroup
                                            label="Tags"
                                            options={options.recipes.tags}
                                            values={recipeFormData.tags}
                                            onChange={handleRecipeTagChange}
                                            helperText="Choose one or more tags."
                                            className="recipe-form-full-row"
                                        />

                                        {/* Ingredients — select from system ingredients list */}
                                        <div className="recipe-ingredients-field recipe-form-full-row">
                                            <label>
                                                Ingredients
                                            </label>

                                            <div className="recipe-ingredient-add-row">
                                                <CustomSelect
                                                    label="Ingredient"
                                                    name="selectedIngredientId"
                                                    value={recipeFormData.selectedIngredientId}
                                                    onChange={handleRecipeFormChange}
                                                    options={[
                                                        { value: "", label: "Choose ingredient" },
                                                        ...ingredientOptions
                                                    ]}
                                                />

                                                <FormField
                                                    label="Quantity"
                                                    type="number"
                                                    name="ingredientQuantity"
                                                    value={recipeFormData.ingredientQuantity}
                                                    onChange={handleRecipeFormChange}
                                                    placeholder="Quantity"
                                                    min="1"
                                                />

                                                <CustomSelect
                                                    label="Unit"
                                                    name="ingredientUnit"
                                                    value={recipeFormData.ingredientUnit}
                                                    onChange={handleRecipeFormChange}
                                                    options={[
                                                        { value: "", label: "Choose unit" },
                                                        ...options.pantry.units.map(u => ({ value: u, label: capitalize(u) }))
                                                    ]}
                                                />

                                                <AppButton
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={handleAddRecipeIngredient}
                                                >
                                                    + Add
                                                </AppButton>
                                            </div>

                                            {recipeFormData.ingredients.length > 0 && (
                                                <div className="recipe-selected-ingredients">
                                                    {recipeFormData.ingredients.map((ingredient) => (
                                                        <div
                                                            key={ingredient.ingredientId}
                                                            className="recipe-selected-ingredient"
                                                        >
                                                            <span>
                                                                {ingredient.name} — {ingredient.quantity} {ingredient.unit}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveRecipeIngredient(ingredient.ingredientId)
                                                                }
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Instructions — entered as numbered steps, joined into one string on submit */}
                                        <div className="recipe-steps-field recipe-form-full-row">
                                            <label>Instructions</label>

                                            <div className="recipe-steps-list">
                                                {recipeFormData.instructionSteps.map((step, index) => (
                                                    <div key={index} className="recipe-step-row">
                                                        <span className="recipe-step-number">
                                                            Step {index + 1}
                                                        </span>

                                                        <input
                                                            type="text"
                                                            className="recipe-step-input"
                                                            value={step}
                                                            onChange={(event) =>
                                                                handleStepChange(index, event.target.value)
                                                            }
                                                            placeholder={`Describe step ${index + 1}`}
                                                        />

                                                        {/* Only show the remove button when there is more than one step */}
                                                        {recipeFormData.instructionSteps.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="recipe-step-remove"
                                                                onClick={() => handleRemoveStep(index)}
                                                                aria-label={`Remove step ${index + 1}`}
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <AppButton
                                                type="button"
                                                variant="secondary"
                                                onClick={handleAddStep}
                                            >
                                                + Add step
                                            </AppButton>
                                        </div>
                                    </div>
                                </form>
                            </FormCard>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------------------
                Page hero
            ---------------------------------------------------------------- */}
            <PageHero
                label="Chef Area"
                title="My Recipes"
                description="View, update and delete only the recipes you created."
                stats={[
                    {
                        value: chefRecipes.length,
                        label: "My recipes"
                    },
                    {
                        value: recipes.length,
                        label: "System recipes"
                    }
                ]}
            />

            {/* ----------------------------------------------------------------
                Toolbar
            ---------------------------------------------------------------- */}
            <section className="recipes-card">
                <div className="recipes-card-header">
                    <div>
                        <h2>Manage my recipes</h2>

                        <p>
                            These are the recipes connected to your chef account.
                        </p>
                    </div>

                    <AppButton
                        type="button"
                        onClick={openCreateRecipeModal}
                    >
                        Create recipe
                    </AppButton>
                </div>
            </section>

            {/* ----------------------------------------------------------------
                Recipe grid
            ---------------------------------------------------------------- */}
            {chefRecipes.length === 0 ? (
                <section className="recipes-empty-state">
                    <div className="recipes-empty-icon">
                        👨‍🍳
                    </div>

                    <h3>No recipes yet</h3>

                    <p>
                        You have not created any recipes yet.
                    </p>
                </section>
            ) : (
                <section className="recipes-grid chef-recipes-grid">
                    {chefRecipes.map((recipe) => {
                        return (
                            <div
                                key={recipe.recipeId}
                                className="chef-recipe-card-wrapper"
                            >
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={setSelectedRecipe}
                                    actions={
                                        <div className="chef-recipe-actions">
                                            <AppButton
                                                type="button"
                                                size="small"
                                                onClick={() =>
                                                    navigate(`/recipes/${recipe.recipeId}/edit`)
                                                }
                                            >
                                                Edit
                                            </AppButton>

                                            <AppButton
                                                type="button"
                                                size="small"
                                                variant="danger"
                                                onClick={() =>
                                                    handleDeleteRecipe(recipe)
                                                }
                                            >
                                                Delete
                                            </AppButton>
                                        </div>
                                    }
                                />
                            </div>
                        );
                    })}
                </section>
            )}
        </div>
    );
}

export default ChefRecipes;
