import "./Recipes.css";
import "./FoodieMyRecipes.css";

import { useEffect, useMemo, useState } from "react";

import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";
import AppButton from "../components/AppButton";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import CustomSelect from "../components/CustomSelect";
import IngredientPicker from "../components/IngredientPicker";
import CheckboxGroup from "../components/CheckboxGroup";

import {
    getMyFoodieRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe
} from "../services/recipeService";

import { getIngredients } from "../services/ingredientsService";
import { getOptions } from "../services/optionsService";
import { validateRecipeForm } from "../validators/recipeValidation";
import { getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";

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
    instructionSteps: [""]
};

const STATUS_LABELS = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected"
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function FoodieMyRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [recipeFormData, setRecipeFormData] = useState(EMPTY_RECIPE_FORM_DATA);
    const [savingRecipe, setSavingRecipe] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState(null);
    const [confirmDeleteRecipe, setConfirmDeleteRecipe] = useState(null);
    const [options, setOptions] = useState({
        recipes: { cuisines: [], categories: [], difficulties: [], tags: [] },
        pantry: { units: [] }
    });

    const storedUser = getStoredUser();

    useEffect(() => {
        async function loadMyRecipes() {
            try {
                setLoading(true);
                setError("");
                const [recipesData, ingredientsData, optionsData] = await Promise.all([
                    getMyFoodieRecipes(storedUser),
                    getIngredients(),
                    getOptions()
                ]);
                setRecipes(Array.isArray(recipesData) ? recipesData : []);
                setIngredients(ingredientsData);
                setOptions(optionsData);
            } catch (err) {
                console.error("Foodie recipes loading error:", err);
                setError(getErrorMessage(err, "Failed to load your recipes."));
            } finally {
                setLoading(false);
            }
        }

        loadMyRecipes();
    }, []);

    useEffect(() => {
        document.body.style.overflow = isFormOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isFormOpen]);

    const pendingRecipes = useMemo(
        () => recipes.filter(r => r.approvalStatus === "pending"),
        [recipes]
    );
    const approvedRecipes = useMemo(
        () => recipes.filter(r => r.approvalStatus === "approved"),
        [recipes]
    );
    const rejectedRecipes = useMemo(
        () => recipes.filter(r => r.approvalStatus === "rejected"),
        [recipes]
    );

    function handleRecipeFormChange(event) {
        const { name, value } = event.target;
        setRecipeFormData(prev => ({ ...prev, [name]: value }));
    }

    function handleAddStep() {
        setRecipeFormData(prev => ({
            ...prev,
            instructionSteps: [...prev.instructionSteps, ""]
        }));
    }

    function handleStepChange(index, value) {
        setRecipeFormData(prev => {
            const newSteps = [...prev.instructionSteps];
            newSteps[index] = value;
            return { ...prev, instructionSteps: newSteps };
        });
    }

    function handleRemoveStep(index) {
        setRecipeFormData(prev => ({
            ...prev,
            instructionSteps: prev.instructionSteps.filter((_, i) => i !== index)
        }));
    }

    function handleAddRecipeIngredient() {
        const ingredientId = recipeFormData.selectedIngredientId;
        const quantity = Number(recipeFormData.ingredientQuantity);
        const unit = recipeFormData.ingredientUnit;

        if (!ingredientId || Number.isNaN(quantity) || quantity <= 0 || !unit) {
            setError("Please choose an ingredient, quantity and unit.");
            return;
        }

        const selectedIngredient = ingredients.find(
            ing => String(ing.ingredientId) === String(ingredientId)
        );

        if (!selectedIngredient) {
            setError("Selected ingredient was not found.");
            return;
        }

        if (recipeFormData.ingredients.some(ing => String(ing.ingredientId) === String(ingredientId))) {
            setError("This ingredient was already added.");
            return;
        }

        setRecipeFormData(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                { ingredientId: selectedIngredient.ingredientId, name: selectedIngredient.name, quantity, unit }
            ],
            selectedIngredientId: "",
            ingredientQuantity: "",
            ingredientUnit: ""
        }));
        setError("");
    }

    function handleRemoveRecipeIngredient(ingredientId) {
        setRecipeFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter(ing => String(ing.ingredientId) !== String(ingredientId))
        }));
    }

    function handleRecipeTagChange(tag) {
        setRecipeFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag]
        }));
    }

    function openCreateForm() {
        setError("");
        setSuccess("");
        setEditingRecipe(null);
        setRecipeFormData(EMPTY_RECIPE_FORM_DATA);
        setIsFormOpen(true);
    }

    function openEditForm(recipe) {
        setError("");
        setSuccess("");
        const instructionSteps = recipe.instructions
            ? recipe.instructions.split(/,\s*/).filter(Boolean)
            : [""];
        setRecipeFormData({
            title: recipe.title || "",
            category: recipe.category || "dinner",
            cuisine: recipe.cuisine || "italian",
            difficulty: recipe.difficulty || "easy",
            prepTime: String(recipe.prepTime ?? ""),
            cookTime: String(recipe.cookTime ?? ""),
            servings: String(recipe.servings ?? ""),
            calories: String(recipe.calories ?? ""),
            tags: recipe.tags || [],
            ingredients: (recipe.ingredients || []).map(ing => ({
                ingredientId: ing.ingredientId,
                name: ing.name || "",
                quantity: ing.quantity || "",
                unit: ing.unit || ""
            })),
            selectedIngredientId: "",
            ingredientQuantity: "",
            ingredientUnit: "",
            instructionSteps: instructionSteps.length > 0 ? instructionSteps : [""]
        });
        setEditingRecipe(recipe);
        setIsFormOpen(true);
    }

    function closeForm() {
        setIsFormOpen(false);
        setEditingRecipe(null);
        setRecipeFormData(EMPTY_RECIPE_FORM_DATA);
        setError("");
    }

    async function handleSaveRecipe(event) {
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
        const instructions = recipeFormData.instructionSteps
            .map(s => s.trim())
            .filter(Boolean)
            .join(", ");

        const payload = {
            title: recipeFormData.title.trim(),
            category: recipeFormData.category,
            cuisine: recipeFormData.cuisine,
            difficulty: recipeFormData.difficulty,
            prepTime,
            cookTime,
            totalTime: prepTime + cookTime,
            servings: Number(recipeFormData.servings),
            calories: Number(recipeFormData.calories),
            instructions,
            creatorId: storedUser.userId,
            tags: recipeFormData.tags,
            ingredients: recipeFormData.ingredients
        };

        try {
            setSavingRecipe(true);
            if (editingRecipe) {
                await updateRecipe(editingRecipe.recipeId, payload, storedUser);
            } else {
                await createRecipe(payload, storedUser);
            }
            const refreshed = await getMyFoodieRecipes(storedUser);
            setRecipes(Array.isArray(refreshed) ? refreshed : []);
            setSuccess(editingRecipe
                ? "Recipe updated and resubmitted for review."
                : "Recipe submitted for admin review.");
            closeForm();
        } catch (err) {
            console.error("Save recipe error:", err);
            setError(getErrorMessage(err, "Failed to save recipe."));
        } finally {
            setSavingRecipe(false);
        }
    }

    async function handleConfirmDelete() {
        const recipe = confirmDeleteRecipe;
        setConfirmDeleteRecipe(null);
        try {
            setError("");
            setSuccess("");
            await deleteRecipe(recipe.recipeId, storedUser);
            setRecipes(prev => prev.filter(r => r.recipeId !== recipe.recipeId));
            setSuccess("Recipe deleted successfully.");
        } catch (err) {
            console.error("Delete recipe error:", err);
            setError(getErrorMessage(err, "Failed to delete recipe."));
        }
    }

    if (loading) {
        return (
            <div className="recipes-page">
                <div className="recipes-message-card">
                    <h1>Loading your recipes...</h1>
                    <p>Please wait while we load your submitted recipes.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recipes-page foodie-recipes-page">
            <MessageModal type="success" title="Success" message={success} onClose={() => setSuccess("")} />
            <MessageModal type="error" title="My Recipes Error" message={error} onClose={() => setError("")} />

            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />

            {confirmDeleteRecipe && (
                <ConfirmDeleteModal
                    label="Delete recipe"
                    description={`Delete "${confirmDeleteRecipe.title}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmDeleteRecipe(null)}
                />
            )}

            {isFormOpen && (
                <div
                    className="recipe-modal-overlay recipe-management-modal-overlay"
                    onClick={closeForm}
                >
                    <div
                        className="recipe-modal recipe-management-modal"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="recipe-modal-close"
                            onClick={closeForm}
                            aria-label="Close recipe form"
                        >
                            ×
                        </button>

                        <div className="recipe-management-modal-body">
                            <FormCard
                                label={editingRecipe ? "Edit recipe" : "Submit recipe"}
                                title={editingRecipe ? "Edit Recipe" : "Submit New Recipe"}
                                description={
                                    editingRecipe
                                        ? "Update your recipe. It will be resubmitted for admin review."
                                        : "Fill in the recipe details. It will be sent for admin review before going public."
                                }
                                className="recipe-form-card"
                                actions={
                                    <>
                                        <AppButton type="submit" form="foodie-recipe-form" disabled={savingRecipe}>
                                            {savingRecipe ? "Submitting..." : editingRecipe ? "Resubmit for Review" : "Submit Recipe"}
                                        </AppButton>
                                        <AppButton type="button" variant="secondary" onClick={closeForm}>
                                            Cancel
                                        </AppButton>
                                    </>
                                }
                            >
                                <form id="foodie-recipe-form" onSubmit={handleSaveRecipe}>
                                    <div className="recipe-form-grid">
                                        <FormField label="Title" type="text" name="title" value={recipeFormData.title} onChange={handleRecipeFormChange} placeholder="Enter recipe title" />
                                        <CustomSelect label="Category" name="category" value={recipeFormData.category} onChange={handleRecipeFormChange} options={options.recipes.categories.map(c => ({ value: c, label: capitalize(c) }))} />
                                        <CustomSelect label="Cuisine" name="cuisine" value={recipeFormData.cuisine} onChange={handleRecipeFormChange} options={options.recipes.cuisines.map(c => ({ value: c, label: capitalize(c) }))} />
                                        <CustomSelect label="Difficulty" name="difficulty" value={recipeFormData.difficulty} onChange={handleRecipeFormChange} options={options.recipes.difficulties.map(d => ({ value: d, label: capitalize(d) }))} />
                                        <FormField label="Prep Time" type="number" name="prepTime" value={recipeFormData.prepTime} onChange={handleRecipeFormChange} placeholder="Minutes" min="0" />
                                        <FormField label="Cook Time" type="number" name="cookTime" value={recipeFormData.cookTime} onChange={handleRecipeFormChange} placeholder="Minutes" min="0" />
                                        <FormField label="Servings" type="number" name="servings" value={recipeFormData.servings} onChange={handleRecipeFormChange} placeholder="Number of servings" min="1" />
                                        <FormField label="Calories" type="number" name="calories" value={recipeFormData.calories} onChange={handleRecipeFormChange} placeholder="Calories" min="1" />

                                        <CheckboxGroup label="Tags" options={options.recipes.tags} values={recipeFormData.tags} onChange={handleRecipeTagChange} helperText="Choose one or more tags." className="recipe-form-full-row" />

                                        <div className="recipe-ingredients-field recipe-form-full-row">
                                            <label>Ingredients</label>
                                            <div className="recipe-ingredient-add-row">
                                                <IngredientPicker label="Ingredient" name="selectedIngredientId" value={recipeFormData.selectedIngredientId} onChange={handleRecipeFormChange} ingredients={ingredients} placeholder="Search ingredient..." />
                                                <FormField label="Quantity" type="number" name="ingredientQuantity" value={recipeFormData.ingredientQuantity} onChange={handleRecipeFormChange} placeholder="Quantity" min="1" />
                                                <CustomSelect label="Unit" name="ingredientUnit" value={recipeFormData.ingredientUnit} onChange={handleRecipeFormChange} options={[{ value: "", label: "Choose unit" }, ...options.pantry.units.map(u => ({ value: u, label: capitalize(u) }))]} />
                                                <AppButton type="button" variant="secondary" onClick={handleAddRecipeIngredient}>+ Add</AppButton>
                                            </div>
                                            {recipeFormData.ingredients.length > 0 && (
                                                <div className="recipe-selected-ingredients">
                                                    {recipeFormData.ingredients.map(ing => (
                                                        <div key={ing.ingredientId} className="recipe-selected-ingredient">
                                                            <span>{ing.name} — {ing.quantity} {ing.unit}</span>
                                                            <button type="button" onClick={() => handleRemoveRecipeIngredient(ing.ingredientId)}>×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="recipe-steps-field recipe-form-full-row">
                                            <label>Instructions</label>
                                            <div className="recipe-steps-list">
                                                {recipeFormData.instructionSteps.map((step, index) => (
                                                    <div key={index} className="recipe-step-row">
                                                        <span className="recipe-step-number">Step {index + 1}</span>
                                                        <input type="text" className="recipe-step-input" value={step} onChange={e => handleStepChange(index, e.target.value)} placeholder={`Describe step ${index + 1}`} />
                                                        {recipeFormData.instructionSteps.length > 1 && (
                                                            <button type="button" className="recipe-step-remove" onClick={() => handleRemoveStep(index)} aria-label={`Remove step ${index + 1}`}>×</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <AppButton type="button" variant="secondary" onClick={handleAddStep}>+ Add step</AppButton>
                                        </div>
                                    </div>
                                </form>
                            </FormCard>
                        </div>
                    </div>
                </div>
            )}

            <PageHero
                label="Foodie Area"
                title="My Recipes"
                description="Submit recipes for review. Track their approval status and resubmit rejected ones."
                stats={[
                    { value: recipes.length, label: "Total submitted" },
                    { value: approvedRecipes.length, label: "Approved" },
                    { value: pendingRecipes.length, label: "Pending review" },
                    { value: rejectedRecipes.length, label: "Rejected" }
                ]}
            />

            <section className="recipes-card">
                <div className="recipes-card-header">
                    <div>
                        <h2>My submitted recipes</h2>
                        <p>Submit a recipe and it will go live once approved by an admin.</p>
                    </div>
                    <AppButton type="button" onClick={openCreateForm}>
                        Submit Recipe
                    </AppButton>
                </div>
            </section>

            {recipes.length === 0 && (
                <section className="recipes-empty-state">
                    <div className="recipes-empty-icon">📝</div>
                    <h3>No recipes submitted yet</h3>
                    <p>Submit your first recipe and it will be reviewed by an admin.</p>
                </section>
            )}

            {pendingRecipes.length > 0 && (
                <section className="foodie-status-section">
                    <div className="foodie-status-header foodie-status-pending">
                        <span className="foodie-status-badge">Pending Review</span>
                        <span className="foodie-status-count">{pendingRecipes.length} recipe{pendingRecipes.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="recipes-grid chef-recipes-grid">
                        {pendingRecipes.map(recipe => (
                            <div key={recipe.recipeId} className="chef-recipe-card-wrapper foodie-card-wrapper">
                                <span className="foodie-card-badge foodie-card-badge--pending">{STATUS_LABELS.pending}</span>
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={setSelectedRecipe}
                                    actions={
                                        <div className="chef-recipe-actions">
                                            <AppButton type="button" size="small" onClick={() => openEditForm(recipe)}>Edit</AppButton>
                                            <AppButton type="button" size="small" variant="danger" onClick={() => setConfirmDeleteRecipe(recipe)}>Delete</AppButton>
                                        </div>
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {approvedRecipes.length > 0 && (
                <section className="foodie-status-section">
                    <div className="foodie-status-header foodie-status-approved">
                        <span className="foodie-status-badge">Approved</span>
                        <span className="foodie-status-count">{approvedRecipes.length} recipe{approvedRecipes.length !== 1 ? "s" : ""} — live on the platform</span>
                    </div>
                    <div className="recipes-grid chef-recipes-grid">
                        {approvedRecipes.map(recipe => (
                            <div key={recipe.recipeId} className="chef-recipe-card-wrapper foodie-card-wrapper">
                                <span className="foodie-card-badge foodie-card-badge--approved">{STATUS_LABELS.approved}</span>
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={setSelectedRecipe}
                                    actions={
                                        <div className="chef-recipe-actions">
                                            <AppButton type="button" size="small" onClick={() => openEditForm(recipe)}>Edit</AppButton>
                                            <AppButton type="button" size="small" variant="danger" onClick={() => setConfirmDeleteRecipe(recipe)}>Delete</AppButton>
                                        </div>
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {rejectedRecipes.length > 0 && (
                <section className="foodie-status-section">
                    <div className="foodie-status-header foodie-status-rejected">
                        <span className="foodie-status-badge">Rejected</span>
                        <span className="foodie-status-count">{rejectedRecipes.length} recipe{rejectedRecipes.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="recipes-grid chef-recipes-grid">
                        {rejectedRecipes.map(recipe => (
                            <div key={recipe.recipeId} className="chef-recipe-card-wrapper foodie-card-wrapper foodie-rejected-wrapper">
                                <span className="foodie-card-badge foodie-card-badge--rejected">{STATUS_LABELS.rejected}</span>
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={setSelectedRecipe}
                                    actions={
                                        <div className="chef-recipe-actions" style={{ flexDirection: "column", gap: "8px" }}>
                                            {recipe.rejectionReason && (
                                                <p className="foodie-rejection-reason">
                                                    Reason: {recipe.rejectionReason}
                                                </p>
                                            )}
                                            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                <AppButton type="button" size="small" onClick={() => openEditForm(recipe)}>Edit &amp; Resubmit</AppButton>
                                                <AppButton type="button" size="small" variant="danger" onClick={() => setConfirmDeleteRecipe(recipe)}>Delete</AppButton>
                                            </div>
                                        </div>
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default FoodieMyRecipes;
