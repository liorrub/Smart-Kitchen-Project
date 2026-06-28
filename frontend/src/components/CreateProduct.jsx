import "./CreateProduct.css";

import { useEffect, useState } from "react";
import { createIngredient } from "../services/ingredientsService";
import { getErrorMessage } from "../utils/apiUtils";
import MessageModal from "./MessageModal";

// List of category options shown in the product form.
const categoryOptions = [
    { value: "pantry", label: "Pantry" },
    { value: "dairy", label: "Dairy" },
    { value: "protein", label: "Protein" },
    { value: "vegetable", label: "Vegetable" },
    { value: "fruit", label: "Fruit" },
    { value: "snack", label: "Snack" },
    { value: "spice", label: "Spice" },
    { value: "household", label: "Household" },
    { value: "other", label: "Other" }
];

// Custom select component used for choosing the product category.
function ProductCustomSelect({ label, value, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    // Find the option that matches the current selected value.
    const selectedOption = options.find(
        (option) => String(option.value) === String(value)
    );

    // Update the selected option and close the dropdown.
    function handleSelect(option) {
        onChange(option.value);
        setIsOpen(false);
    }

    // Render the dropdown field and its options.
    return (
        <div className="create-product-field">
            <label>{label}</label>

            <div
                className={
                    isOpen
                        ? "create-product-select open"
                        : "create-product-select"
                }
            >
                <button
                    type="button"
                    className="create-product-select-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{selectedOption?.label || "Choose option"}</span>
                    <span>{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                    <div className="create-product-select-menu">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    String(option.value) === String(value)
                                        ? "create-product-select-option selected"
                                        : "create-product-select-option"
                                }
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Modal for creating a new product or using an existing one.
function CreateProductModal({
                                isOpen,
                                onClose,
                                onProductReady,
                                existingIngredients = [],
                                headers = {}
                            }) {
    // Store the form values for the new product.
    const [formData, setFormData] = useState({
        name: "",
        category: "pantry",
        isAllergen: false
    });

    // Track whether the product is currently being saved.
    const [saving, setSaving] = useState(false);

    // Store validation or server error messages.
    const [error, setError] = useState("");

    // Prevent page scrolling while the modal is open.
    useEffect(() => {
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Do not render the modal when it is closed.
    if (!isOpen) {
        return null;
    }

    // Clear the form and remove any error message.
    function resetForm() {
        setFormData({
            name: "",
            category: "pantry",
            isAllergen: false
        });

        setError("");
    }

    // Close the modal only when a save action is not running.
    function handleClose() {
        if (saving) {
            return;
        }

        resetForm();
        onClose();
    }

    // Update one field in the form and clear the current error.
    function updateField(name, value) {
        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setError("");
    }

    // Validate the form and create the product if needed.
    async function handleSubmit(event) {
        event.preventDefault();

        const productName = formData.name.trim().replace(/\s+/g, " ");

        if (!productName) {
            setError("Please enter product name.");
            return;
        }

        // Check if a product with the same name already exists.
        const existingIngredient = existingIngredients.find(
            (ingredient) =>
                ingredient.name.toLowerCase() === productName.toLowerCase()
        );

        // Use the existing product instead of creating a duplicate.
        if (existingIngredient) {
            onProductReady(existingIngredient, true);
            resetForm();
            onClose();
            return;
        }

        try {
            setSaving(true);
            setError("");

            // Send the new product data to the server.
            const createdIngredient = await createIngredient(
                {
                    name: productName,
                    category: formData.category,
                    isAllergen: formData.isAllergen
                },
                headers
            );

            // Return the created product to the parent component.
            onProductReady(createdIngredient, false);
            resetForm();
            onClose();
        } catch (err) {
            console.error("Create product error:", err);
            console.error("Server response:", err.response?.data);

            setError(
                getErrorMessage(err, "Failed to create product.")
            );
        } finally {
            setSaving(false);
        }
    }

    // Render the modal, form fields, and action buttons.
    return (
        <>
            <div
                className="create-product-overlay"
                onMouseDown={handleClose}
            >
                <div
                    className="create-product-modal"
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <div className="create-product-header">
                        <div>
                            <p className="create-product-label">New Product</p>
                            <h2>Create Product</h2>
                            <span>
                                Add a new product to the system and use it in
                                your pantry or shopping list.
                            </span>
                        </div>

                        <button
                            type="button"
                            className="create-product-close"
                            onClick={handleClose}
                        >
                            ×
                        </button>
                    </div>

                    <form
                        className="create-product-form"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div className="create-product-field">
                            <label>Product Name</label>

                            <input
                                type="text"
                                value={formData.name}
                                onChange={(event) =>
                                    updateField("name", event.target.value)
                                }
                                placeholder="Product name"
                                autoFocus
                            />
                        </div>

                        <ProductCustomSelect
                            label="Category"
                            value={formData.category}
                            options={categoryOptions}
                            onChange={(value) => updateField("category", value)}
                        />

                        <label className="create-product-checkbox-row">
                            <input
                                type="checkbox"
                                checked={formData.isAllergen}
                                onChange={(event) =>
                                    updateField("isAllergen", event.target.checked)
                                }
                            />

                            <span>Mark as allergen</span>
                        </label>

                        <div className="create-product-actions">
                            <button
                                type="button"
                                className="create-product-cancel"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="create-product-save"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <MessageModal
                type="error"
                title="Error"
                message={error}
                onClose={() => setError("")}
            />
        </>
    );
}

export default CreateProductModal;