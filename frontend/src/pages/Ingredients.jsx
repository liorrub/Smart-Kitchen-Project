import "./Ingredients.css";

import { useEffect, useMemo, useState } from "react";

import PageErrorState from "../components/PageErrorState";
import AppButton from "../components/AppButton";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
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
import { formatText } from "../utils/formatUtils";

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

const PAGE_SIZE = 10;

function Ingredients() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState(EMPTY_FORM_DATA);
    const [editingIngredientId, setEditingIngredientId] = useState(null);
    const [ingredientToDelete, setIngredientToDelete] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Load all ingredients from the server when the page mounts.
    useEffect(() => {
        loadIngredients();
    }, []);

    // Prevent page scrolling while a create/edit or delete modal is open.
    useEffect(() => {
        const isOpen = isFormModalOpen || !!ingredientToDelete;
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isFormModalOpen, ingredientToDelete]);

    const totalPages = Math.max(1, Math.ceil(ingredients.length / PAGE_SIZE));
    const paginatedIngredients = useMemo(
        () => ingredients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [ingredients, currentPage]
    );

    // Count allergen ingredients for the hero stats section.
    const allergenCount = useMemo(() => {
        return ingredients.filter((ingredient) => ingredient.isAllergen).length;
    }, [ingredients]);

    // Count distinct ingredient categories for the hero stats section.
    const categoriesCount = useMemo(() => {
        return new Set(
            ingredients.map((ingredient) => ingredient.category)
        ).size;
    }, [ingredients]);

    // Fetch all ingredients from the server and update the table.
    async function loadIngredients() {
        setLoadError("");
        try {
            setLoading(true);

            const data = await getIngredients();

            setIngredients(Array.isArray(data) ? data : []);
            setCurrentPage(1);
            setError("");
        } catch (err) {
            console.error("Ingredients loading error:", err);

            setLoadError(
                !err.response
                    ? "Unable to connect to the server. Please try again in a few moments."
                    : "Failed to load ingredients."
            );
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

    // Pre-populate the form with the selected ingredient's data and open the edit modal.
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

    // Validate and save the ingredient (create or update), then reload the list.
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

    // Delete the selected ingredient on the server and reload the list.
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

    if (loadError) {
        return (
            <div className="ingredients-page">
                <PageErrorState
                    title="Ingredients Error"
                    message={loadError}
                    onRetry={() => { setLoadError(""); loadIngredients(); }}
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
                            <th>Name</th>
                            <th>Category</th>
                            <th>Allergen</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {paginatedIngredients.map((ingredient) => (
                            <tr key={ingredient.ingredientId}>
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

                {totalPages > 1 && (
                    <div className="ingredients-pagination">
                        <button
                            type="button"
                            className="ingredients-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ← Previous
                        </button>
                        <span className="ingredients-pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            className="ingredients-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next →
                        </button>
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

                        <div className="ingredient-modal-body">
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
                </div>
            )}

            {ingredientToDelete && (
                <ConfirmDeleteModal
                    label="Delete ingredient"
                    description={`Delete ${ingredientToDelete.name}? This action cannot be undone.`}
                    isDeleting={deleting}
                    onConfirm={confirmDeleteIngredient}
                    onCancel={cancelDeleteIngredient}
                />
            )}
        </div>
    );
}

export default Ingredients;
