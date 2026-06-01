import { useEffect, useState } from "react";
import { getAIHistory } from "../services/aiHistoryService";
import DataTable from "../components/DataTable";

function AIHistory() {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadHistory() {

            try {

                const data = await getAIHistory();
                setHistory(data);

            } catch {

                setError("Failed to load AI history");

            } finally {

                setLoading(false);
            }
        }

        loadHistory();

    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>

            <h1>AI History</h1>

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

        </div>
    );
}

export default AIHistory;