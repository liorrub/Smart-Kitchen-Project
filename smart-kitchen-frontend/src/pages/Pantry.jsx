import "./Pantry.css";

import PageHero from "../components/PageHero";
import MessageModal from "../components/MessageModal";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import CreateProduct from "../components/CreateProduct";
import CreateProductButton from "../components/CreateProductButton";
import { getIngredients } from "../services/ingredientsService";
import { getResponseData, getErrorMessage } from "../utils/apiUtils";
import { getStoredUser, getAuthHeaders } from "../utils/authUtils";
import { formatText } from "../utils/formatUtils";

const USERS_API_URL = "http://localhost:3000/api/users";

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

function formatDate(value) {
    if (!value) {
        return "No expiry date";
    }

    return new Date(value).toLocaleDateString("en-GB");
}

function isItemExpired(item) {
    if (item.isExpired === true) {
        return true;
    }

    if (!item.expiryDate) {
        return false;
    }

    return new Date(item.expiryDate) < new Date();
}

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

function CustomSelect({
                          label,
                          name,
                          value,
                          options,
                          onChange
                      }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(
        (option) => String(option.value) === String(value)
    );

    function handleSelect(option) {
        onChange({
            target: {
                name,
                value: option.value
            }
        });

        setIsOpen(false);
    }

    return (
        <div className="pantry-field pantry-custom-select-field">
            <label>{label}</label>

            <div
                className={
                    isOpen
                        ? "pantry-custom-select open"
                        : "pantry-custom-select"
                }
            >
                <button
                    type="button"
                    className="pantry-custom-select-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>
                        {selectedOption?.label || "Choose option"}
                    </span>

                    <span className="pantry-custom-select-arrow">
                        {isOpen ? "▲" : "▼"}
                    </span>
                </button>

                {isOpen && (
                    <div className="pantry-custom-select-menu">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    String(option.value) === String(value)
                                        ? "pantry-custom-select-option selected"
                                        : "pantry-custom-select-option"
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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

    const storedUser = getStoredUser();

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

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load pantry."
                    )
                );
            } finally {
                setLoading(false);
            }
        }

        loadPageData();
    }, []);

    const ingredientOptions = useMemo(() => {
        return [
            {
                value: "",
                label: "Choose product"
            },
            ...ingredients.map((ingredient) => ({
                value: String(ingredient.ingredientId),
                label: ingredient.name
            }))
        ];
    }, [ingredients]);

    const expiringSoonItems = useMemo(() => {
        return pantryItems.filter((item) => isItemExpiringSoon(item));
    }, [pantryItems]);

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
                response.data.data
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

    return (
        <div className="pantry-page">
            <MessageModal
                type="success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
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
                        <CustomSelect
                            label="Product"
                            name="ingredientId"
                            value={formData.ingredientId}
                            options={ingredientOptions}
                            onChange={handleChange}
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
                        {visibleItems.map((item) => {
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

                                        <div>
                                            <h3>
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
                                        className="delete-pantry-button"
                                        onClick={() =>
                                            deletePantryItem(
                                                item.pantryItemId
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Pantry;
