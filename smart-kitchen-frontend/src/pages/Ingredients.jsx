import { useEffect, useState } from "react";
import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient
} from "../services/ingredientsService";
import { validateIngredientForm } from "../validators/ingredientValidation";

function Ingredients() {

    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        isAllergen: "false"
    });

    const [editingIngredientId, setEditingIngredientId] = useState(null);
    const [ingredientToDelete, setIngredientToDelete] = useState(null);

    useEffect(() => {
        loadIngredients();
    }, []);

    async function loadIngredients() {
        try {
            setLoading(true);

            const data = await getIngredients();
            setIngredients(data);
            setError("");
        }
        catch (error) {
            console.error(error);
            setError("Failed to load ingredients");
        }
        finally {
            setLoading(false);
        }
    }

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData(previousData => ({
            ...previousData,
            [name]: value
        }));
    }

    function resetForm() {
        setFormData({
            name: "",
            category: "",
            isAllergen: "false"
        });

        setEditingIngredientId(null);
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
            if (editingIngredientId) {
                await updateIngredient(
                    editingIngredientId,
                    ingredientData
                );

                setMessage("Ingredient updated successfully.");
            }
            else {
                await createIngredient(
                    ingredientData
                );

                setMessage("Ingredient added successfully.");
            }

            resetForm();
            await loadIngredients();
        }
        catch (error) {
            console.error(error);
            setError("Failed to save ingredient.");
        }
    }

    function handleEdit(ingredient) {
        setEditingIngredientId(ingredient.ingredientId);

        setFormData({
            name: ingredient.name || "",
            category: ingredient.category || "",
            isAllergen: ingredient.isAllergen ? "true" : "false"
        });

        setError("");
        setMessage("");
    }

    function handleDeleteClick(ingredient) {
        setIngredientToDelete(ingredient);
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
            await deleteIngredient(
                ingredientToDelete.ingredientId
            );

            await loadIngredients();

            setMessage("Ingredient deleted successfully.");
            setIngredientToDelete(null);
        }
        catch (error) {
            console.error(error);
            setError("Failed to delete ingredient.");
        }
    }

    function cancelDeleteIngredient() {
        setIngredientToDelete(null);
    }

    if (loading) {
        return (
            <div>
                <h1>Ingredients Management</h1>

                <p>Loading ingredients...</p>
            </div>
        );
    }

    return (
        <div>
            <h1>
                Ingredients Management
            </h1>

            {error && <p>{error}</p>}

            {message && <p>{message}</p>}

            {
                ingredientToDelete &&
                (
                    <div>
                        <p>
                            Are you sure you want to delete
                            {" "}
                            {ingredientToDelete.name}
                            ?
                        </p>

                        <button
                            type="button"
                            onClick={confirmDeleteIngredient}
                        >
                            Yes, delete
                        </button>

                        <button
                            type="button"
                            onClick={cancelDeleteIngredient}
                        >
                            Cancel
                        </button>
                    </div>
                )
            }

            <h2>
                {
                    editingIngredientId
                        ? "Edit Ingredient"
                        : "Add New Ingredient"
                }
            </h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Name:
                    </label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>
                        Category:
                    </label>

                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>
                        Is Allergen:
                    </label>

                    <select
                        name="isAllergen"
                        value={formData.isAllergen}
                        onChange={handleChange}
                    >
                        <option value="false">
                            No
                        </option>

                        <option value="true">
                            Yes
                        </option>
                    </select>
                </div>

                <button type="submit">
                    {
                        editingIngredientId
                            ? "Update Ingredient"
                            : "Add Ingredient"
                    }
                </button>

                {
                    editingIngredientId &&
                    (
                        <button
                            type="button"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    )
                }
            </form>

            <hr />

            <h2>
                Existing Ingredients
            </h2>

            <table>
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
                {
                    ingredients.map(ingredient => (
                        <tr key={ingredient.ingredientId}>
                            <td>
                                {ingredient.ingredientId}
                            </td>

                            <td>
                                {ingredient.name}
                            </td>

                            <td>
                                {ingredient.category}
                            </td>

                            <td>
                                {
                                    ingredient.isAllergen
                                        ? "Yes"
                                        : "No"
                                }
                            </td>

                            <td>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEdit(ingredient)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteClick(ingredient)
                                    }
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>
    );
}

export default Ingredients;