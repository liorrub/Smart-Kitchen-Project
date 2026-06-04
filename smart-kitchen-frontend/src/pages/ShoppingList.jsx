import "./ShoppingList.css";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import CreateProductModal from "../components/CreateProduct";
import CreateProductButton from "../components/CreateProductButton";
import CustomSelect from "../components/CustomSelect";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

const USERS_API_URL = "http://localhost:3000/api/users";
const INGREDIENTS_API_URL = "http://localhost:3000/api/ingredients";

const unitOptions = [
    {
        value: "piece",
        label: "Piece"
    },
    {
        value: "kg",
        label: "Kg"
    },
    {
        value: "gram",
        label: "Gram"
    },
    {
        value: "liter",
        label: "Liter"
    },
    {
        value: "ml",
        label: "Ml"
    },
    {
        value: "pack",
        label: "Pack"
    }
];

function getStoredUser() {
    return JSON.parse(localStorage.getItem("user"));
}

function getAuthHeaders() {
    const storedUser = getStoredUser();

    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole || storedUser?.role
    };
}

function formatText(value) {
    if (!value) {
        return "Unknown";
    }

    return value
        .replace("-", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

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

function getResponseData(response) {
    return response.data?.data || response.data || [];
}

function ShoppingList() {
    const [shoppingItems, setShoppingItems] = useState([]);
    const [ingredients, setIngredients] = useState([]);

    const [formData, setFormData] = useState({
        ingredientId: "",
        quantity: "",
        unit: "piece"
    });

    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const storedUser = getStoredUser();

    const activeMessage = success || error;

    useEffect(() => {
        loadPageData();
    }, []);

    async function loadPageData() {
        try {
            setLoading(true);
            setError("");

            if (!storedUser?.userId) {
                setError("User was not found. Please login again.");
                return;
            }

            const [shoppingResponse, ingredientsResponse] =
                await Promise.all([
                    axios.get(
                        `${USERS_API_URL}/${storedUser.userId}/shopping-list`,
                        {
                            headers: getAuthHeaders(),
                            params: {
                                _t: Date.now()
                            }
                        }
                    ),
                    axios.get(
                        INGREDIENTS_API_URL,
                        {
                            headers: getAuthHeaders(),
                            params: {
                                _t: Date.now()
                            }
                        }
                    )
                ]);

            setShoppingItems(getResponseData(shoppingResponse));
            setIngredients(getResponseData(ingredientsResponse));
        } catch (err) {
            console.error("Shopping list loading error:", err);
            console.error("Server response:", err.response?.data);

            setError(
                getErrorMessage(
                    err,
                    "Failed to load shopping list."
                )
            );
        } finally {
            setLoading(false);
        }
    }

    const ingredientOptions = useMemo(() => {
        return [
            {
                value: "",
                label: "Choose ingredient"
            },
            ...ingredients.map((ingredient) => ({
                value: String(ingredient.ingredientId),
                label: ingredient.name
            }))
        ];
    }, [ingredients]);

    const visibleItems = useMemo(() => {
        if (filter === "completed") {
            return shoppingItems.filter((item) => item.completed);
        }

        if (filter === "active") {
            return shoppingItems.filter((item) => !item.completed);
        }

        return shoppingItems;
    }, [shoppingItems, filter]);

    const completedCount = shoppingItems.filter(
        (item) => item.completed
    ).length;

    const activeCount = shoppingItems.length - completedCount;

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

    function handleProductReady(product, alreadyExists) {
        const productData = product?.data || product;

        if (!productData?.ingredientId) {
            setSuccess("Product is ready to use.");
            return;
        }

        setIngredients((previousIngredients) => {
            const productAlreadyInList = previousIngredients.some(
                (ingredient) =>
                    ingredient.ingredientId === productData.ingredientId
            );

            if (productAlreadyInList) {
                return previousIngredients;
            }

            return [...previousIngredients, productData];
        });

        setFormData((previousData) => ({
            ...previousData,
            ingredientId: String(productData.ingredientId)
        }));

        setError("");

        setSuccess(
            alreadyExists
                ? "Product already exists and was selected."
                : "Product created and selected."
        );
    }

    async function handleAddItem(event) {
        event.preventDefault();

        if (!formData.ingredientId || !formData.quantity) {
            setError("Please choose an ingredient and enter quantity.");
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
                `${USERS_API_URL}/${storedUser.userId}/shopping-list`,
                {
                    ingredientId: Number(formData.ingredientId),
                    quantity: quantityNumber,
                    unit: formData.unit
                },
                {
                    headers: getAuthHeaders()
                }
            );

            setShoppingItems((previousItems) => [
                ...previousItems,
                response.data.data
            ]);

            setFormData({
                ingredientId: "",
                quantity: "",
                unit: "piece"
            });

            setSuccess("Item added to shopping list.");
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to add shopping item."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    async function toggleCompleted(item) {
        try {
            setError("");
            setSuccess("");

            const response = await axios.put(
                `${USERS_API_URL}/${storedUser.userId}/shopping-list/${item.shoppingItemId}`,
                {
                    completed: !item.completed
                },
                {
                    headers: getAuthHeaders()
                }
            );

            setShoppingItems((previousItems) =>
                previousItems.map((currentItem) =>
                    currentItem.shoppingItemId === item.shoppingItemId
                        ? response.data.data
                        : currentItem
                )
            );
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to update shopping item."
                )
            );
        }
    }

    async function deleteItem(itemId) {
        try {
            setError("");
            setSuccess("");

            await axios.delete(
                `${USERS_API_URL}/${storedUser.userId}/shopping-list/${itemId}`,
                {
                    headers: getAuthHeaders()
                }
            );

            setShoppingItems((previousItems) =>
                previousItems.filter(
                    (item) => item.shoppingItemId !== itemId
                )
            );

            setSuccess("Item deleted successfully.");
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to delete shopping item."
                )
            );
        }
    }

    async function generateShoppingList() {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const response = await axios.post(
                `${USERS_API_URL}/${storedUser.userId}/shopping-list/generate`,
                {},
                {
                    headers: getAuthHeaders()
                }
            );

            setShoppingItems((previousItems) => [
                ...previousItems,
                ...(response.data.data || [])
            ]);

            setSuccess("Shopping list generated from expired pantry items.");
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to generate shopping list."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="shopping-page">
                <div className="shopping-message-card">
                    <h1>Loading shopping list...</h1>
                    <p>Please wait while we prepare your items.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shopping-page">
            <MessageModal
                type={success ? "success" : "error"}
                title={success ? "Success" : "Shopping List Error"}
                message={activeMessage}
                buttonText="Got It 👍"
                onClose={() => {
                    setSuccess("");
                    setError("");
                }}
            />

            <CreateProductModal
                isOpen={isCreateProductOpen}
                onClose={() => setIsCreateProductOpen(false)}
                onProductReady={handleProductReady}
                existingIngredients={ingredients}
                headers={getAuthHeaders()}
            />

            <PageHero
                label="Shopping List"
                title="Plan your groceries smarter"
                description="Add items, track what you already bought and generate groceries from expired pantry products."
                stats={[
                    {
                        value: shoppingItems.length,
                        label: "Total items"
                    },
                    {
                        value: activeCount,
                        label: "Still needed"
                    },
                    {
                        value: completedCount,
                        label: "Completed"
                    }
                ]}
            />

            <section className="shopping-card">
                <div className="shopping-card-header">
                    <div>
                        <h2>Add New Item</h2>
                        <p>Choose an ingredient and add it to your list.</p>
                    </div>

                    <div className="shopping-header-actions">
                        <CreateProductButton
                            onClick={() => setIsCreateProductOpen(true)}
                        />

                        <button
                            type="button"
                            className="generate-button"
                            onClick={generateShoppingList}
                            disabled={saving}
                        >
                            Generate from Pantry
                        </button>
                    </div>
                </div>

                <form
                    className="shopping-form"
                    onSubmit={handleAddItem}
                    noValidate
                >
                    <div className="shopping-form-grid">
                        <CustomSelect
                            label="Ingredient"
                            name="ingredientId"
                            value={formData.ingredientId}
                            options={ingredientOptions}
                            onChange={handleChange}
                        />

                        <FormField
                            label="Quantity"
                            type="text"
                            name="quantity"
                            inputMode="decimal"
                            value={formData.quantity}
                            onChange={handleQuantityChange}
                            placeholder="Amount"
                        />

                        <CustomSelect
                            label="Unit"
                            name="unit"
                            value={formData.unit}
                            options={unitOptions}
                            onChange={handleChange}
                        />

                        <button
                            type="submit"
                            className="add-item-button"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Add Item"}
                        </button>
                    </div>
                </form>
            </section>

            <section className="shopping-card">
                <div className="shopping-list-header">
                    <div>
                        <h2>Your Shopping List</h2>
                        <p>Mark items as completed when you buy them.</p>
                    </div>

                    <div className="shopping-filters">
                        <button
                            type="button"
                            className={filter === "all" ? "active" : ""}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={filter === "active" ? "active" : ""}
                            onClick={() => setFilter("active")}
                        >
                            Needed
                        </button>

                        <button
                            type="button"
                            className={filter === "completed" ? "active" : ""}
                            onClick={() => setFilter("completed")}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                {visibleItems.length === 0 ? (
                    <div className="shopping-empty-state">
                        <div className="shopping-empty-icon">🛒</div>
                        <h3>No items found</h3>
                        <p>Add a new item or change the current filter.</p>
                    </div>
                ) : (
                    <div className="shopping-items-list">
                        {visibleItems.map((item) => (
                            <article
                                key={item.shoppingItemId}
                                className={
                                    item.completed
                                        ? "shopping-item completed"
                                        : "shopping-item"
                                }
                            >
                                <button
                                    type="button"
                                    className="shopping-check-button"
                                    onClick={() => toggleCompleted(item)}
                                >
                                    {item.completed ? "✓" : ""}
                                </button>

                                <div className="shopping-item-content">
                                    <h3>
                                        {getIngredientName(item.ingredientId)}
                                    </h3>

                                    <p>
                                        {item.quantity} {formatText(item.unit)}
                                    </p>
                                </div>

                                <span className="shopping-status">
                                    {item.completed ? "Completed" : "Needed"}
                                </span>

                                <button
                                    type="button"
                                    className="delete-shopping-button"
                                    onClick={() =>
                                        deleteItem(item.shoppingItemId)
                                    }
                                >
                                    Delete
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default ShoppingList;
