import "./AdminRecipeQueue.css";
import "./Recipes.css";

import { useEffect, useState } from "react";

import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import RecipeDetailsModal from "../components/RecipeDetailsModal";
import AppButton from "../components/AppButton";
import FormField from "../components/FormField";

import {
    getPendingRecipes,
    approveRecipe,
    rejectRecipe
} from "../services/recipeService";

import { getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";

function AdminRecipeQueue() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [rejectingRecipe, setRejectingRecipe] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const storedUser = getStoredUser();

    useEffect(() => {
        async function loadQueue() {
            try {
                setLoading(true);
                setError("");
                const data = await getPendingRecipes(storedUser);
                setRecipes(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Recipe queue loading error:", err);
                setError(getErrorMessage(err, "Failed to load pending recipes."));
            } finally {
                setLoading(false);
            }
        }

        loadQueue();
    }, []);

    async function handleApprove(recipe) {
        try {
            setActionLoading(recipe.recipeId);
            setError("");
            await approveRecipe(recipe.recipeId, storedUser);
            setRecipes(prev => prev.filter(r => r.recipeId !== recipe.recipeId));
            setSuccess(`"${recipe.title}" approved and is now live.`);
        } catch (err) {
            console.error("Approve error:", err);
            setError(getErrorMessage(err, "Failed to approve recipe."));
        } finally {
            setActionLoading(null);
        }
    }

    function openRejectModal(recipe) {
        setRejectingRecipe(recipe);
        setRejectReason("");
        setError("");
    }

    async function handleConfirmReject() {
        if (!rejectReason.trim()) {
            setError("Please enter a rejection reason.");
            return;
        }

        const recipe = rejectingRecipe;
        try {
            setActionLoading(recipe.recipeId);
            setError("");
            await rejectRecipe(recipe.recipeId, rejectReason.trim(), storedUser);
            setRecipes(prev => prev.filter(r => r.recipeId !== recipe.recipeId));
            setRejectingRecipe(null);
            setRejectReason("");
            setSuccess(`"${recipe.title}" has been rejected.`);
        } catch (err) {
            console.error("Reject error:", err);
            setError(getErrorMessage(err, "Failed to reject recipe."));
        } finally {
            setActionLoading(null);
        }
    }

    if (loading) {
        return (
            <div className="recipes-page">
                <div className="recipes-message-card">
                    <h1>Loading pending recipes...</h1>
                    <p>Please wait while we load the approval queue.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recipes-page admin-queue-page">
            <MessageModal type="success" title="Success" message={success} onClose={() => setSuccess("")} />
            <MessageModal type="error" title="Queue Error" message={error} onClose={() => setError("")} />

            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />

            {rejectingRecipe && (
                <div className="message-modal-overlay admin-reject-overlay">
                    <div className="admin-reject-modal">
                        <h3>Reject Recipe</h3>
                        <p>
                            You are rejecting <strong>&quot;{rejectingRecipe.title}&quot;</strong>.
                            The creator will be notified. Please provide a reason.
                        </p>
                        <FormField
                            label="Rejection reason"
                            type="text"
                            name="rejectReason"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Explain why this recipe is rejected..."
                        />
                        <div className="admin-reject-actions">
                            <AppButton
                                type="button"
                                variant="danger"
                                disabled={actionLoading === rejectingRecipe.recipeId}
                                onClick={handleConfirmReject}
                            >
                                {actionLoading === rejectingRecipe.recipeId ? "Rejecting..." : "Confirm Reject"}
                            </AppButton>
                            <AppButton
                                type="button"
                                variant="secondary"
                                onClick={() => setRejectingRecipe(null)}
                            >
                                Cancel
                            </AppButton>
                        </div>
                    </div>
                </div>
            )}

            <PageHero
                label="Admin Area"
                title="Recipe Approval Queue"
                description="Review submitted recipes and approve or reject them. Approved recipes go live immediately."
                stats={[
                    { value: recipes.length, label: "Pending review" }
                ]}
            />

            {recipes.length === 0 ? (
                <section className="recipes-empty-state">
                    <div className="recipes-empty-icon">✓</div>
                    <h3>Queue is empty</h3>
                    <p>All submitted recipes have been reviewed. Check back later.</p>
                </section>
            ) : (
                <section className="admin-queue-list">
                    {recipes.map(recipe => {
                        const creator = recipe.creator;
                        const isProcessing = actionLoading === recipe.recipeId;

                        return (
                            <div key={recipe.recipeId} className="admin-queue-card">
                                <div className="admin-queue-card-info">
                                    <div className="admin-queue-card-title">
                                        <h3>{recipe.title}</h3>
                                        <span className="admin-queue-submitted">
                                            Submitted {recipe.createdAt
                                                ? new Date(recipe.createdAt).toLocaleDateString()
                                                : "—"}
                                        </span>
                                    </div>

                                    <div className="admin-queue-card-meta">
                                        {creator && (
                                            <span className="admin-queue-creator">
                                                By {creator.firstName} {creator.lastName}
                                            </span>
                                        )}
                                        <span className="admin-queue-tag">{recipe.cuisine}</span>
                                        <span className="admin-queue-tag">{recipe.category}</span>
                                        <span className="admin-queue-tag">{recipe.difficulty}</span>
                                    </div>

                                    {recipe.instructions && (
                                        <p className="admin-queue-preview">
                                            {recipe.instructions.length > 140
                                                ? recipe.instructions.slice(0, 140) + "…"
                                                : recipe.instructions}
                                        </p>
                                    )}
                                </div>

                                <div className="admin-queue-card-actions">
                                    <AppButton
                                        type="button"
                                        size="small"
                                        variant="secondary"
                                        onClick={() => setSelectedRecipe(recipe)}
                                    >
                                        View Details
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        size="small"
                                        disabled={isProcessing}
                                        onClick={() => handleApprove(recipe)}
                                    >
                                        {isProcessing ? "Processing..." : "Approve"}
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        size="small"
                                        variant="danger"
                                        disabled={isProcessing}
                                        onClick={() => openRejectModal(recipe)}
                                    >
                                        Reject
                                    </AppButton>
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}
        </div>
    );
}

export default AdminRecipeQueue;
