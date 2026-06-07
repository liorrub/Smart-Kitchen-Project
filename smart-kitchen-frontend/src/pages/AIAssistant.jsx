import { useEffect, useState } from "react";
import { getAIHistory } from "../services/aiHistoryService";
import DataTable from "../components/DataTable";

function AIAssistant() {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState("");

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getAIHistory();
                setHistory(data);
            } catch {
                setHistoryError("Failed to load AI history");
            } finally {
                setLoadingHistory(false);
            }
        }

        loadHistory();
    }, []);

    return (
        <div>
            <h1>AI Assistant</h1>

            <p>
                Use smart AI tools to generate recipes, analyze food images,
                and find ingredient substitutes.
            </p>

            <section>
                <h2>AI Features</h2>

                <div>
                    <div>
                        <h3>Generate Recipe from Pantry</h3>
                        <p>
                            Create a recipe based on ingredients that already
                            exist in your pantry.
                        </p>
                        <button type="button">
                            Generate Recipe
                        </button>
                    </div>

                    <div>
                        <h3>Analyze Food Image</h3>
                        <p>
                            Upload a food image and get a recipe suggestion
                            based on the image.
                        </p>
                        <button type="button">
                            Analyze Image
                        </button>
                    </div>

                    <div>
                        <h3>Ingredient Substitute</h3>
                        <p>
                            Get a substitute suggestion when a recipe is missing
                            an ingredient.
                        </p>
                        <button type="button">
                            Suggest Substitute
                        </button>
                    </div>
                </div>
            </section>

            <section>
                <h2>Previous AI Conversations</h2>

                {loadingHistory && <p>Loading AI history...</p>}

                {historyError && <p>{historyError}</p>}

                {!loadingHistory && !historyError && (
                    <DataTable
                        columns={[
                            {
                                key: "historyId",
                                label: "ID"
                            },
                            {
                                key: "prompt",
                                label: "Prompt"
                            }
                        ]}
                        data={history}
                    />
                )}
            </section>
        </div>
    );
}

export default AIAssistant;