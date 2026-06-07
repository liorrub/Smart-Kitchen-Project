import "./Ingredients.css";

import { useEffect, useMemo, useState } from "react";

import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient
} from "../services/ingredientsService";

import { validateIngredientForm } from "../validators/ingredientValidation";

const EMPTY_FORM_DATA = {
    name: "",
    category: "pantry",
    isAllergen: "false"
};

const CATEGORY_OPTIONS = [
    {
        value: "pantry",
        label: "Pantry"
    },
    {
        value: "dairy",
        label: "Dairy"
    },
    {
        value: "protein",
        label: "Protein"
    },
    {
        value: "vegetable",
        label: "Vegetable"
    },
    {
        value: "other",
        label: "Other"
    }
];

const ALLERGEN_OPTIONS = [
    {
        value: "false",
        label: "No"
    },
    {
        value: "true",
        label: "Yes"
    }
];

function formatText(value) {
    if (!value) {
        return "Unknown";
    }

    return String(value)
        .replace("-", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState(EMPTY_FORM_DATA);
    const [editingIngredientId, setEditingIngredientId] = useState(null);
    const [ingredientToDelete, setIngredientToDelete] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadIngredients();
    }, []);

    const allergenCount = useMemo(() => {
        return ingredients.filter((ingredient) => ingredient.isAllergen).length;
    }, [ingredients]);

    const categoriesCount = useMemo(() => {
        return new Set(
            ingredients.map((ingredient) => ingredient.category)
        ).size;
    }, [ingredients]);

    async function loadIngredients() {
        try {
            setLoading(true);

            const data = await getIngredients();

            setIngredients(Array.isArray(data) ? data : []);
            setError("");
        } catch (err) {
            console.error("Ingredients loading error:", err);

            setError("Failed to load ingredients.");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    }

    function resetForm() {
        setFormData(EMPTY_FORM_DATA);
        setEditingIngredientId(null);
    }

    function openCreateModal() {
        setError("");
        setMessage("");
        setIngredientToDelete(null);
        resetForm();
        setIsFormModalOpen(true);
    }

    function openEditModal(ingredient) {
        setEditingIngredientId(ingredient.ingredientId);

        setFormData({
            name: ingredient.name || "",
            category: ingredient.category || "pantry",
            isAllergen: ingredient.isAllergen ? "true" : "false"
        });

        setIngredientToDelete(null);
        setError("");
        setMessage("");
        setIsFormModalOpen(true);
    }

    function closeFormModal() {
        setIsFormModalOpen(false);
        resetForm();
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setMessage("");

        const ingredientData = {
            name: formData.name.trim(),
            category: formData.category.trim(),
            isAllergen: formData.isAllergen === "true"
        };

        const validationError = validateIngredientForm(ingredientData);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            if (editingIngredientId) {
                await updateIngredient(
                    editingIngredientId,
                    ingredientData
                );

                setMessage("Ingredient updated successfully.");
            } else {
                await createIngredient(ingredientData);

                setMessage("Ingredient added successfully.");
            }

            closeFormModal();
            await loadIngredients();
        } catch (err) {
            console.error("Save ingredient error:", err);

            setError("Failed to save ingredient.");
        } finally {
            setSaving(false);
        }
    }

    function openDeleteModal(ingredient) {
        setIngredientToDelete(ingredient);
        setIsFormModalOpen(false);
        setError("");
        setMessage("");
    }

    async function confirmDeleteIngredient() {
        if (!ingredientToDelete) {
            return;
        }

        setError("");
        setMessage("");

        try {
            setDeleting(true);

            await deleteIngredient(ingredientToDelete.ingredientId);
            await loadIngredients();

            setMessage("Ingredient deleted successfully.");
            setIngredientToDelete(null);
        } catch (err) {
            console.error("Delete ingredient error:", err);

            setError("Failed to delete ingredient.");
        } finally {
            setDeleting(false);
        }
    }

    function cancelDeleteIngredient() {
        setIngredientToDelete(null);
    }

    if (loading) {
        return (
            <div className="ingredients-page">
                <FormCard
                    title="Loading ingredients..."
                    description="Please wait while we prepare the ingredients list."
                />
            </div>
        );
    }

    return (
        <div className="ingredients-page">
            <MessageModal
                type="success"
                title="Success"
                message={message}
                onClose={() => setMessage("")}
            />

            <MessageModal
                type="error"
                title="Ingredients Error"
                message={error}
                onClose={() => setError("")}
            />

            <PageHero
                label="Ingredients"
                title="Ingredients Management"
                description="Manage all system ingredients, categories and allergen flags in one organized place."
                stats={[
                    {
                        value: ingredients.length,
                        label: "Ingredients"
                    },
                    {
                        value: categoriesCount,
                        label: "Categories"
                    },
                    {
                        value: allergenCount,
                        label: "Allergens"
                    }
                ]}
            />

            <section className="ingredients-toolbar">
                <div>
                    <p>Ingredient library</p>

                    <h2>Existing Ingredients</h2>

                    <span>
                        Add new ingredients, update categories and keep allergen information accurate.
                    </span>
                </div>

                <AppButton
                    type="button"
                    onClick={openCreateModal}
                >
                    Add Ingredient
                </AppButton>
            </section>

            <section className="ingredients-table-card">
                <div className="ingredients-table-wrapper">
                    <table className="ingredients-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Allergen</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {ingredients.map((ingredient) => (
                            <tr key={ingredient.ingredientId}>
                                <td>{ingredient.ingredientId}</td>

                                <td>
                                    <strong className="ingredient-name">
                                        {ingredient.name}
                                    </strong>
                                </td>

                                <td>
                                        <span className="ingredient-category-badge">
                                            {formatText(ingredient.category)}
                                        </span>
                                </td>

                                <td>
                                        <span
                                            className={
                                                ingredient.isAllergen
                                                    ? "ingredient-allergen-badge yes"
                                                    : "ingredient-allergen-badge no"
                                            }
                                        >
                                            {ingredient.isAllergen ? "Yes" : "No"}
                                        </span>
                                </td>

                                <td>
                                    <div className="ingredients-actions">
                                        <button
                                            type="button"
                                            className="ingredients-edit-button"
                                            onClick={() =>
                                                openEditModal(ingredient)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="ingredients-delete-button"
                                            onClick={() =>
                                                openDeleteModal(ingredient)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {ingredients.length === 0 && (
                    <div className="ingredients-empty-state">
                        <div>🥬</div>

                        <h3>No ingredients yet</h3>

                        <p>
                            Add your first ingredient to start building the kitchen database.
                        </p>
                    </div>
                )}
            </section>

            {isFormModalOpen && (
                <div
                    className="ingredient-modal-overlay"
                    onClick={closeFormModal}
                >
                    <div
                        className="ingredient-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="ingredient-modal-close"
                            onClick={closeFormModal}
                            aria-label="Close ingredient modal"
                        >
                            ×
                        </button>

                        <FormCard
                            label={
                                editingIngredientId
                                    ? "Edit ingredient"
                                    : "Create ingredient"
                            }
                            title={
                                editingIngredientId
                                    ? "Update Ingredient"
                                    : "Add New Ingredient"
                            }
                            description="Fill in the ingredient details and choose whether it is an allergen."
                            className="ingredient-form-card"
                            actions={
                                <>
                                    <AppButton
                                        type="submit"
                                        form="ingredient-form"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingIngredientId
                                                ? "Save Changes"
                                                : "Add Ingredient"}
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        variant="secondary"
                                        onClick={closeFormModal}
                                    >
                                        Cancel
                                    </AppButton>
                                </>
                            }
                        >
                            <form
                                id="ingredient-form"
                                onSubmit={handleSubmit}
                            >
                                <div className="ingredient-form-grid">
                                    <FormField
                                        label="Name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter ingredient name"
                                    />

                                    <CustomSelect
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        options={CATEGORY_OPTIONS}
                                    />

                                    <CustomSelect
                                        label="Is Allergen"
                                        name="isAllergen"
                                        value={formData.isAllergen}
                                        onChange={handleChange}
                                        options={ALLERGEN_OPTIONS}
                                    />
                                </div>
                            </form>
                        </FormCard>
                    </div>
                </div>
            )}

            {ingredientToDelete && (
                <div
                    className="ingredient-modal-overlay"
                    onClick={cancelDeleteIngredient}
                >
                    <div
                        className="ingredient-confirm-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <FormCard
                            label="Delete ingredient"
                            title="Are you sure?"
                            description={`Delete ${ingredientToDelete.name}? This action cannot be undone.`}
                            className="ingredient-confirm-card"
                            actions={
                                <>
                                    <AppButton
                                        type="button"
                                        variant="danger"
                                        disabled={deleting}
                                        onClick={confirmDeleteIngredient}
                                    >
                                        {deleting ? "Deleting..." : "Yes, delete"}
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        variant="secondary"
                                        onClick={cancelDeleteIngredient}
                                    >
                                        Cancel
                                    </AppButton>
                                </>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Ingredients;
