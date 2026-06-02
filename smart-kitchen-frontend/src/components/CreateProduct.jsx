import "./CreateProduct.css";

import { useState } from "react";
import { createIngredient } from "../services/ingredientsService";

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

function getErrorMessage(err, fallbackMessage) {
    const responseData = err.response?.data;

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof responseData?.error === "string") {
        return responseData.error;
    }

    if (typeof responseData?.error?.message === "string") {
        return responseData.error.message;
    }

    if (typeof err.message === "string") {
        return err.message;
    }

    return fallbackMessage;
}

function ProductCustomSelect({ label, value, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(
        (option) => String(option.value) === String(value)
    );

    function handleSelect(option) {
        onChange(option.value);
        setIsOpen(false);
    }

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

function CreateProductModal({
                                isOpen,
                                onClose,
                                onProductReady,
                                existingIngredients = [],
                                headers = {}
                            }) {
    const [formData, setFormData] = useState({
        name: "",
        category: "pantry",
        isAllergen: false
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) {
        return null;
    }

    function resetForm() {
        setFormData({
            name: "",
            category: "pantry",
            isAllergen: false
        });

        setError("");
    }

    function handleClose() {
        if (saving) {
            return;
        }

        resetForm();
        onClose();
    }

    function updateField(name, value) {
        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const productName = formData.name.trim().replace(/\s+/g, " ");

        if (!productName) {
            setError("Please enter product name.");
            return;
        }

        const existingIngredient = existingIngredients.find(
            (ingredient) =>
                ingredient.name.toLowerCase() === productName.toLowerCase()
        );

        if (existingIngredient) {
            onProductReady(existingIngredient, true);
            resetForm();
            onClose();
            return;
        }

        try {
            setSaving(true);
            setError("");

            const createdIngredient = await createIngredient(
                {
                    name: productName,
                    category: formData.category,
                    isAllergen: formData.isAllergen
                },
                headers
            );

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

    return (
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

                {error && (
                    <div className="create-product-error">
                        {error}
                    </div>
                )}

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
    );
}

export default CreateProductModal;