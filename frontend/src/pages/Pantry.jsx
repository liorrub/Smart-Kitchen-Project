import "./Pantry.css";

import PageErrorState from "../components/PageErrorState";
import AppButton from "../components/AppButton";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import PageHero from "../components/PageHero";
import MessageModal from "../components/MessageModal";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CreateProduct from "../components/CreateProduct";
import CreateProductButton from "../components/CreateProductButton";
import CustomSelect from "../components/CustomSelect";
import IngredientPicker from "../components/IngredientPicker";
import { getIngredients } from "../services/ingredientsService";
import { getResponseData, getErrorMessage, getNestedResponseData } from "../utils/apiUtils";
import { getStoredUser, getAuthHeaders } from "../utils/authUtils";
import { formatText } from "../utils/formatUtils";
import { API_BASE_URL } from "../utils/apiConfig";

const USERS_API_URL = `${API_BASE_URL}/users`;

const unitOptions = [
    { value: "piece", label: "Piece" },
    { value: "gram", label: "Gram" },
    { value: "kg", label: "Kg" },
    { value: "ml", label: "Ml" },
    { value: "liter", label: "Liter" },
    { value: "cup", label: "Cup" },
    { value: "tbsp", label: "Tbsp" },
    { value: "tsp", label: "Tsp" }
];

const locationOptions = [
    { value: "pantry", label: "Pantry" },
    { value: "fridge", label: "Fridge" },
    { value: "freezer", label: "Freezer" }
];

const PAGE_SIZE = 9;

// Format a raw date value as a short localized "DD/MM/YYYY" string.
function formatDate(value) {
    if (!value) {
        return "No expiry date";
    }

    return new Date(value).toLocaleDateString("en-GB");
}

// Check whether a pantry item has passed its expiry date or is explicitly flagged as expired.
function isItemExpired(item) {
    if (item.isExpired === true) {
        return true;
    }

    if (!item.expiryDate) {
        return false;
    }

    return new Date(item.expiryDate) < new Date();
}

// Check whether a non-expired pantry item expires within the next 7 days.
function isItemExpiringSoon(item) {
    if (!item.expiryDate || isItemExpired(item)) {
        return false;
    }

    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const sevenDaysFromNow = new Date();

    sevenDaysFromNow.setDate(today.getDate() + 7);

    return expiryDate <= sevenDaysFromNow;
}

// Return the number of whole days remaining until an expiry date, or null if no date is set.
function getDaysUntilExpiry(expiryDate) {
    if (!expiryDate) {
        return null;
    }

    const today = new Date();
    const expiry = new Date(expiryDate);

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Map a storage location string to its CSS class name for color-coding pantry items.
function getLocationClass(location) {
    switch ((location || "").toLowerCase()) {
        case "fridge":
            return "location-fridge";
        case "freezer":
            return "location-freezer";
        case "pantry":
            return "location-pantry";
        default:
            return "location-default";
    }
}

// Convert an ISO date string to the YYYY-MM-DD format required by HTML date inputs.
function toDateInputValue(isoString) {
    if (!isoString) {
        return "";
    }
    return new Date(isoString).toISOString().split("T")[0];
}

function Pantry() {
    const [pantryItems, setPantryItems] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const [formData, setFormData] = useState({
        ingredientId: "",
        quantity: "",
        unit: "piece",
        expiryDate: "",
        location: "pantry"
    });

    const [filter, setFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [success, setSuccess] = useState("");
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

    // Edit modal state
    const [editingItem, setEditingItem] = useState(null);
    const [editFormData, setEditFormData] = useState({
        quantity: "",
        unit: "piece",
        expiryDate: "",
        location: "pantry"
    });
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState("");
    const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

    const storedUser = getStoredUser();

    // Load the user's pantry items and the ingredients catalog in parallel on page open.
    useEffect(() => {
        async function loadPageData() {
            const storedUser = getStoredUser();

            try {
                setLoading(true);
                setError("");

                if (!storedUser?.userId) {
                    setError("User was not found. Please login again.");
                    return;
                }

                const [pantryResponse, ingredientsResponse] =
                    await Promise.all([
                        axios.get(
                            `${USERS_API_URL}/${storedUser.userId}/pantry`,
                            {
                                headers: getAuthHeaders(),
                                params: {
                                    _t: Date.now()
                                }
                            }
                        ),
                        getIngredients(getAuthHeaders())
                    ]);

                setPantryItems(getResponseData(pantryResponse));
                setIngredients(ingredientsResponse);
            } catch (err) {
                console.error("Pantry loading error:", err);
                console.error("Server response:", err.response?.data);

                setLoadError(
                    !err.response
                        ? "Unable to connect to the server. Please try again in a few moments."
                        : getErrorMessage(err, "Failed to load pantry.")
                );
            } finally {
                setLoading(false);
            }
        }

        loadPageData();
    }, []);

    // Lock page scroll while the edit modal is open.
    useEffect(() => {
        if (editingItem) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [editingItem]);

    // Reset to page 1 when the filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    // Filter items expiring within 7 days for the warning banner at the top of the page.
    const expiringSoonItems = useMemo(() => {
        return pantryItems.filter((item) => isItemExpiringSoon(item));
    }, [pantryItems]);

    // Apply the active filter (location, expired, expiring soon, or all) to the pantry items list.
    const visibleItems = useMemo(() => {
        if (filter === "expired") {
            return pantryItems.filter((item) => isItemExpired(item));
        }

        if (filter === "soon") {
            return pantryItems.filter((item) => isItemExpiringSoon(item));
        }

        if (filter !== "all") {
            return pantryItems.filter((item) => item.location === filter);
        }

        return pantryItems;
    }, [pantryItems, filter]);

    const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
    const pagedItems = useMemo(
        () => visibleItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [visibleItems, currentPage]
    );

    const totalCount = pantryItems.length;

    const fridgeCount = pantryItems.filter(
        (item) => item.location === "fridge"
    ).length;

    const pantryCount = pantryItems.filter(
        (item) => item.location === "pantry"
    ).length;

    const freezerCount = pantryItems.filter(
        (item) => item.location === "freezer"
    ).length;

    const expiredCount = pantryItems.filter(
        (item) => isItemExpired(item)
    ).length;

    const soonCount = expiringSoonItems.length;

    // Look up an ingredient's display name by its ID from the local ingredients list.
    function getIngredientName(ingredientId) {
        const ingredient = ingredients.find(
            (item) => item.ingredientId === ingredientId
        );

        return ingredient ? ingredient.name : `Ingredient #${ingredientId}`;
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setError("");
        setSuccess("");
    }

    // Allow only numeric or decimal input in the quantity field; reject any other characters.
    function handleQuantityChange(event) {
        const value = event.target.value;

        if (/^\d*\.?\d*$/.test(value)) {
            setFormData((previousData) => ({
                ...previousData,
                quantity: value
            }));

            setError("");
            setSuccess("");
        }
    }

    function openCreateProductModal() {
        setError("");
        setSuccess("");
        setIsCreateProductOpen(true);
    }

    function closeCreateProductModal() {
        setIsCreateProductOpen(false);
    }

    // Called when a product is created or selected in the CreateProduct modal; adds it to the ingredient list and pre-selects it in the form.
    function handleProductReady(product, wasExisting) {
        setIngredients((previousIngredients) => {
            const alreadyExists = previousIngredients.some(
                (ingredient) =>
                    ingredient.ingredientId === product.ingredientId
            );

            if (alreadyExists) {
                return previousIngredients;
            }

            return [...previousIngredients, product];
        });

        setFormData((previousData) => ({
            ...previousData,
            ingredientId: String(product.ingredientId)
        }));

        setSuccess(
            wasExisting
                ? `${product.name} already exists and was selected.`
                : `${product.name} was created and selected.`
        );
    }

    // Validate and submit the add-item form, then append the new item to the local list.
    async function handleAddPantryItem(event) {
        event.preventDefault();

        if (
            !formData.ingredientId ||
            !formData.quantity ||
            !formData.expiryDate ||
            !formData.location
        ) {
            setError("Please fill all required fields.");
            return;
        }

        const quantityNumber = Number(formData.quantity);

        if (
            !Number.isFinite(quantityNumber) ||
            quantityNumber <= 0
        ) {
            setError("Quantity must be greater than 0.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await axios.post(
                `${USERS_API_URL}/${storedUser.userId}/pantry`,
                {
                    ingredientId: Number(formData.ingredientId),
                    quantity: quantityNumber,
                    unit: formData.unit,
                    expiryDate: new Date(
                        `${formData.expiryDate}T23:59:59`
                    ).toISOString(),
                    location: formData.location
                },
                {
                    headers: getAuthHeaders()
                }
            );

            setPantryItems((previousItems) => [
                ...previousItems,
                getNestedResponseData(response)
            ]);

            setFormData({
                ingredientId: "",
                quantity: "",
                unit: "piece",
                expiryDate: "",
                location: "pantry"
            });

            setSuccess("Item added to pantry.");
        } catch (err) {
            console.error("Add pantry item error:", err);
            console.error("Server response:", err.response?.data);

            setError(
                getErrorMessage(
                    err,
                    "Failed to add pantry item."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    function handleDeletePantryClick(item) {
        setConfirmDeleteItem(item);
    }

    async function handleConfirmDeletePantry() {
        const item = confirmDeleteItem;
        setConfirmDeleteItem(null);
        await deletePantryItem(item.pantryItemId);
    }

    // Delete a pantry item on the server and remove it from the local list.
    async function deletePantryItem(pantryItemId) {
        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${USERS_API_URL}/${storedUser.userId}/pantry/${pantryItemId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            setPantryItems((previousItems) =>
                previousItems.filter(
                    (item) => item.pantryItemId !== pantryItemId
                )
            );

            setSuccess("Pantry item deleted successfully.");
        } catch (err) {
            console.error("Delete pantry item error:", err);
            console.error("Server response:", err.response?.data);

            setError(
                getErrorMessage(
                    err,
                    "Failed to delete pantry item."
                )
            );
        }
    }

    // Open the edit modal pre-filled with the item's current values.
    function handleEditClick(item) {
        setEditingItem(item);
        setEditFormData({
            quantity: String(item.quantity),
            unit: item.unit,
            expiryDate: toDateInputValue(item.expiryDate),
            location: item.location
        });
        setEditError("");
    }

    // Close the edit modal without saving.
    function handleEditClose() {
        setEditingItem(null);
        setEditError("");
    }

    // Handle text/date field changes in the edit form.
    function handleEditChange(event) {
        const { name, value } = event.target;
        setEditFormData((previous) => ({ ...previous, [name]: value }));
        setEditError("");
    }

    // Allow only numeric or decimal input in the edit quantity field.
    function handleEditQuantityChange(event) {
        const value = event.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setEditFormData((previous) => ({ ...previous, quantity: value }));
            setEditError("");
        }
    }

    // Submit the edit form: validate, call PUT, and replace the item in the list.
    async function handleEditSubmit(event) {
        event.preventDefault();

        if (!editFormData.quantity || !editFormData.expiryDate) {
            setEditError("Please fill all required fields.");
            return;
        }

        const quantityNumber = Number(editFormData.quantity);

        if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
            setEditError("Quantity must be greater than 0.");
            return;
        }

        try {
            setEditSaving(true);
            setEditError("");

            const response = await axios.put(
                `${USERS_API_URL}/${storedUser.userId}/pantry/${editingItem.pantryItemId}`,
                {
                    quantity: quantityNumber,
                    unit: editFormData.unit,
                    expiryDate: new Date(
                        `${editFormData.expiryDate}T23:59:59`
                    ).toISOString(),
                    location: editFormData.location
                },
                {
                    headers: getAuthHeaders()
                }
            );

            const updatedItem = getNestedResponseData(response);

            setPantryItems((previousItems) =>
                previousItems.map((item) =>
                    item.pantryItemId === updatedItem.pantryItemId
                        ? updatedItem
                        : item
                )
            );

            setEditingItem(null);
            setSuccess("Pantry item updated successfully.");
        } catch (err) {
            console.error("Update pantry item error:", err);
            console.error("Server response:", err.response?.data);

            setEditError(
                getErrorMessage(
                    err,
                    "Failed to update pantry item."
                )
            );
        } finally {
            setEditSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="pantry-page">
                <div className="pantry-message-card">
                    <h1>Loading pantry...</h1>
                    <p>Please wait while we prepare your kitchen inventory.</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="pantry-page">
                <PageErrorState
                    title="Pantry Error"
                    message={loadError}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    return (
        <div className="pantry-page">
            <MessageModal
                type="success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
                title="Pantry Error"
                message={error}
                onClose={() => setError("")}
            />

            <CreateProduct
                isOpen={isCreateProductOpen}
                onClose={closeCreateProductModal}
                onProductReady={handleProductReady}
                existingIngredients={ingredients}
                headers={getAuthHeaders()}
            />

            {editingItem && (
                <div
                    className="pantry-edit-modal-overlay"
                    onClick={handleEditClose}
                >
                    <div
                        className="pantry-edit-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="pantry-edit-modal-close"
                            onClick={handleEditClose}
                            aria-label="Close edit form"
                        >
                            ×
                        </button>

                        <div className="pantry-edit-modal-header">
                            <p className="pantry-edit-modal-label">Editing</p>
                            <h2>{getIngredientName(editingItem.ingredientId)}</h2>
                        </div>

                        <form
                            className="pantry-edit-form"
                            onSubmit={handleEditSubmit}
                            noValidate
                        >
                            <div className="pantry-edit-form-grid">
                                <div className="pantry-field">
                                    <label>Quantity</label>
                                    <input
                                        type="text"
                                        name="quantity"
                                        inputMode="decimal"
                                        value={editFormData.quantity}
                                        onChange={handleEditQuantityChange}
                                        placeholder="Amount"
                                    />
                                </div>

                                <CustomSelect
                                    label="Unit"
                                    name="unit"
                                    value={editFormData.unit}
                                    options={unitOptions}
                                    onChange={handleEditChange}
                                    wrapperClassName="pantry-field pantry-custom-select-field"
                                />

                                <div className="pantry-field">
                                    <label>Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={editFormData.expiryDate}
                                        onChange={handleEditChange}
                                    />
                                </div>

                                <CustomSelect
                                    label="Location"
                                    name="location"
                                    value={editFormData.location}
                                    options={locationOptions}
                                    onChange={handleEditChange}
                                    wrapperClassName="pantry-field pantry-custom-select-field"
                                />
                            </div>

                            {editError && (
                                <p className="pantry-edit-error">
                                    {editError}
                                </p>
                            )}

                            <div className="pantry-edit-modal-actions">
                                <button
                                    type="button"
                                    className="pantry-edit-cancel-button"
                                    onClick={handleEditClose}
                                    disabled={editSaving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="pantry-edit-save-button"
                                    disabled={editSaving}
                                >
                                    {editSaving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <PageHero
                label="Pantry"
                title="Manage your kitchen inventory"
                description="Track what you have at home, where it is stored and when it expires."
                stats={[
                    {
                        value: totalCount,
                        label: "Total Items"
                    },
                    {
                        value: fridgeCount,
                        label: "Fridge"
                    },
                    {
                        value: pantryCount,
                        label: "Pantry"
                    },
                    {
                        value: freezerCount,
                        label: "Freezer"
                    },
                    {
                        value: expiredCount,
                        label: "Expired"
                    }
                ]}
            />

            {soonCount > 0 && (
                <section className="pantry-soon-card">
                    <div className="pantry-soon-heading">
                        <div className="pantry-soon-icon">⏰</div>

                        <div>
                            <p className="pantry-soon-label">Heads up</p>
                            <h2>Products expiring soon</h2>
                            <span>
                                These products should be used soon to avoid waste.
                            </span>
                        </div>
                    </div>

                    <div className="pantry-soon-list">
                        {expiringSoonItems
                            .slice(0, 4)
                            .map((item) => {
                                const daysLeft = getDaysUntilExpiry(
                                    item.expiryDate
                                );

                                return (
                                    <article
                                        key={item.pantryItemId}
                                        className="pantry-soon-item"
                                    >
                                        <strong>
                                            {getIngredientName(
                                                item.ingredientId
                                            )}
                                        </strong>

                                        <span>
                                            Expires {formatDate(item.expiryDate)}
                                        </span>

                                        <small>
                                            {daysLeft === 0
                                                ? "Expires today"
                                                : `${daysLeft} days left`}
                                        </small>
                                    </article>
                                );
                            })}
                    </div>
                </section>
            )}

            <section className="pantry-card">
                <div className="pantry-card-header">
                    <div>
                        <h2>Add Pantry Item</h2>
                        <p>Choose a product and add it to your kitchen.</p>
                    </div>

                    <CreateProductButton
                        onClick={openCreateProductModal}
                    />
                </div>

                <form
                    className="pantry-form"
                    onSubmit={handleAddPantryItem}
                    noValidate
                >
                    <div className="pantry-form-grid">
                        <IngredientPicker
                            label="Product"
                            name="ingredientId"
                            value={formData.ingredientId}
                            onChange={handleChange}
                            ingredients={ingredients}
                            placeholder="Search product..."
                            wrapperClassName="pantry-field pantry-custom-select-field"
                        />

                        <div className="pantry-field">
                            <label>Quantity</label>

                            <input
                                type="text"
                                name="quantity"
                                inputMode="decimal"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                placeholder="Amount"
                            />
                        </div>

                        <CustomSelect
                            label="Unit"
                            name="unit"
                            value={formData.unit}
                            options={unitOptions}
                            onChange={handleChange}
                            wrapperClassName="pantry-field pantry-custom-select-field"
                        />

                        <div className="pantry-field">
                            <label>Expiry Date</label>

                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                            />
                        </div>

                        <CustomSelect
                            label="Location"
                            name="location"
                            value={formData.location}
                            options={locationOptions}
                            onChange={handleChange}
                            wrapperClassName="pantry-field pantry-custom-select-field"
                        />

                        <button
                            type="submit"
                            className="add-pantry-button"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Add Item"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="pantry-card">
                <div className="pantry-list-header">
                    <div>
                        <h2>Your Pantry</h2>
                        <p>See what you have and what needs attention.</p>
                    </div>

                    <div className="pantry-filters">
                        <button
                            type="button"
                            className={filter === "all" ? "active" : ""}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={filter === "pantry" ? "active" : ""}
                            onClick={() => setFilter("pantry")}
                        >
                            Pantry
                        </button>

                        <button
                            type="button"
                            className={filter === "fridge" ? "active" : ""}
                            onClick={() => setFilter("fridge")}
                        >
                            Fridge
                        </button>

                        <button
                            type="button"
                            className={filter === "freezer" ? "active" : ""}
                            onClick={() => setFilter("freezer")}
                        >
                            Freezer
                        </button>

                        <button
                            type="button"
                            className={filter === "soon" ? "active" : ""}
                            onClick={() => setFilter("soon")}
                        >
                            Expiring Soon
                        </button>

                        <button
                            type="button"
                            className={filter === "expired" ? "active" : ""}
                            onClick={() => setFilter("expired")}
                        >
                            Expired
                        </button>
                    </div>
                </div>

                {visibleItems.length === 0 ? (
                    <div className="pantry-empty-state">
                        <div className="pantry-empty-icon">🥫</div>
                        <h3>Your pantry is empty</h3>
                        <p>
                            Add your first product above or create a new product
                            if it does not exist yet.
                        </p>
                    </div>
                ) : (
                    <div className="pantry-items-list">
                        {pagedItems.map((item) => {
                            const expired = isItemExpired(item);
                            const expiringSoon = isItemExpiringSoon(item);

                            const statusClass = expired
                                ? "status-expired"
                                : expiringSoon
                                    ? "status-soon"
                                    : "status-fresh";

                            return (
                                <article
                                    key={item.pantryItemId}
                                    className={`pantry-item ${statusClass}`}
                                >
                                    <div className="pantry-item-main">
                                        <span
                                            className={`pantry-location-pill ${getLocationClass(
                                                item.location
                                            )}`}
                                        >
                                            {formatText(item.location)}
                                        </span>

                                        <div className="pantry-item-details">
                                            <h3 title={getIngredientName(item.ingredientId)}>
                                                {getIngredientName(
                                                    item.ingredientId
                                                )}
                                            </h3>

                                            <p>
                                                {item.quantity}{" "}
                                                {formatText(item.unit)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pantry-expiry">
                                        <span>Expires</span>
                                        <strong>
                                            {formatDate(item.expiryDate)}
                                        </strong>
                                    </div>

                                    <span
                                        className={
                                            expired
                                                ? "pantry-status expired"
                                                : expiringSoon
                                                    ? "pantry-status soon"
                                                    : "pantry-status fresh"
                                        }
                                    >
                                        {expired
                                            ? "Expired"
                                            : expiringSoon
                                                ? "Soon"
                                                : "Fresh"}
                                    </span>

                                    <button
                                        type="button"
                                        className="edit-pantry-button"
                                        onClick={() => handleEditClick(item)}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        className="delete-pantry-button"
                                        onClick={() => handleDeletePantryClick(item)}
                                    >
                                        Delete
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
                {visibleItems.length > 0 && totalPages > 1 && (
                    <div className="pantry-pagination">
                        <button
                            type="button"
                            className="pantry-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ← Previous
                        </button>
                        <span className="pantry-pagination-info">Page {currentPage} of {totalPages}</span>
                        <button
                            type="button"
                            className="pantry-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </section>

            {confirmDeleteItem && (
                <ConfirmDeleteModal
                    label="Delete pantry item"
                    description={`Delete "${getIngredientName(confirmDeleteItem.ingredientId)}" from your pantry? This action cannot be undone.`}
                    onConfirm={handleConfirmDeletePantry}
                    onCancel={() => setConfirmDeleteItem(null)}
                />
            )}
        </div>
    );
}

export default Pantry;
