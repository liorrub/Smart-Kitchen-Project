import { useEffect, useState } from "react";
import { getIngredients } from "../services/ingredientsService";
import DataTable from "../components/DataTable";

function Ingredients() {

    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadIngredients() {

            try {

                const data = await getIngredients();
                setIngredients(data);

            } catch {

                setError("Failed to load ingredients");

            } finally {

                setLoading(false);
            }
        }

        loadIngredients();

    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>

            <h1>Ingredients Management</h1>

            <DataTable
                columns={[
                    {
                        key: "ingredientId",
                        label: "ID"
                    },
                    {
                        key: "name",
                        label: "Name"
                    },
                    {
                        key: "category",
                        label: "Category"
                    },
                    {
                        key: "isAllergen",
                        label: "Allergen"
                    }
                ]}
                data={ingredients}
            />

        </div>
    );
}

export default Ingredients;