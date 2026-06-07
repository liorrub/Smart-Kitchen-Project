import "./AIAssistant.css";

import { useEffect, useState } from "react";

import AppButton from "../components/AppButton";
import DataTable from "../components/DataTable";
import FormCard from "../components/FormCard";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import { getAIHistory } from "../services/aiHistoryService";

const AI_FEATURES = [
    {
        title: "Generate Recipe from Pantry",
        description:
            "Create a recipe idea based on ingredients that already exist in your pantry.",
        buttonText: "Generate Recipe",
        icon: "🥘",
        accent: "green"
    },
    {
        title: "Analyze Food Image",
        description:
            "Upload a food image and get a recipe suggestion based on what appears in the image.",
        buttonText: "Analyze Image",
        icon: "📸",
        accent: "orange"
    },
    {
        title: "Ingredient Substitute",
        description:
            "Find a smart substitute when a recipe is missing an ingredient.",
        buttonText: "Suggest Substitute",
        icon: "🔁",
        accent: "pink"
    }
];

function AIAssistant() {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState("");
    const [featureMessage, setFeatureMessage] = useState("");

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getAIHistory();

                setHistory(Array.isArray(data) ? data : []);
            } catch {
                setHistoryError("Failed to load AI history");
            } finally {
                setLoadingHistory(false);
            }
        }

        loadHistory();
    }, []);

    function handleFeatureClick(featureTitle) {
        setFeatureMessage(
            `${featureTitle} is ready for the next implementation step.`
        );
    }

    return (
        <div className="ai-assistant-page">
            <MessageModal
                type="success"
                title="AI Assistant"
                message={featureMessage}
                onClose={() => setFeatureMessage("")}
            />

            <PageHero
                label="AI Assistant"
                title="Smart tools for smarter cooking"
                description="Generate recipe ideas, analyze food images, and find ingredient substitutes using AI-powered kitchen tools."
                stats={[
                    {
                        value: AI_FEATURES.length,
                        label: "AI tools"
                    },
                    {
                        value: history.length,
                        label: "Past prompts"
                    },
                    {
                        value: loadingHistory ? "..." : "Ready",
                        label: "Status"
                    }
                ]}
            />

            <section className="ai-features-section">
                <div className="ai-section-heading">
                    <p>AI Features</p>

                    <h2>Choose what you want the assistant to do</h2>

                    <span>
                        Each tool is designed for a different kitchen task, so the page feels clear and easy to use.
                    </span>
                </div>

                <div className="ai-features-grid">
                    {AI_FEATURES.map((feature) => (
                        <article
                            key={feature.title}
                            className={`ai-feature-card ai-feature-${feature.accent}`}
                        >
                            <div className="ai-feature-icon">
                                {feature.icon}
                            </div>

                            <div className="ai-feature-content">
                                <h3>{feature.title}</h3>

                                <p>{feature.description}</p>
                            </div>

                            <AppButton
                                type="button"
                                onClick={() =>
                                    handleFeatureClick(feature.title)
                                }
                            >
                                {feature.buttonText}
                            </AppButton>
                        </article>
                    ))}
                </div>
            </section>

            <FormCard
                label="History"
                title="Previous AI Conversations"
                description="Review previous AI prompts and continue improving your kitchen workflow."
                className="ai-history-card"
            >
                {loadingHistory && (
                    <div className="ai-history-state">
                        <div className="ai-loading-spinner" />

                        <p>Loading AI history...</p>
                    </div>
                )}

                {!loadingHistory && history.length === 0 && (
                    <div className="ai-empty-state">
                        <div>💬</div>

                        <h3>No AI conversations yet</h3>

                        <p>
                            Once you start using AI tools, your previous prompts will appear here.
                        </p>
                    </div>
                )}

                {!loadingHistory && history.length > 0 && (
                    <div className="ai-history-table-wrapper">
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
                )}
            </FormCard>
        </div>
    );
}

export default AIAssistant;
