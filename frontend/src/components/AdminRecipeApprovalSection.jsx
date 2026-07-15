import "./AdminRecipeApprovalSection.css";

import { useEffect, useState } from "react";

import AppButton from "./AppButton";
import FormField from "./FormField";
import RecipeDetailsModal from "./RecipeDetailsModal";

import { getPendingRecipes, approveRecipe, rejectRecipe } from "../services/recipeService";
import { usePendingRecipes } from "../context/PendingRecipeContext";
import { getStoredUser } from "../utils/authUtils";
import { getErrorMessage } from "../utils/apiUtils";

function AdminRecipeApprovalSection() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [rejectingRecipe, setRejectingRecipe] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const { refreshCount } = usePendingRecipes();
    const storedUser = getStoredUser();

    useEffect(() => {
        loadQueue();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadQueue() {
        try {
            setLoading(true);
            setError("");
            const data = await getPendingRecipes(storedUser);
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(getErrorMessage(err, "Failed to load pending recipes."));
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(recipe) {
        try {
            setActionLoading(recipe.recipeId);
            setError("");
            setSuccess("");
            await approveRecipe(recipe.recipeId, storedUser);
            setRecipes(prev => prev.filter(r => r.recipeId !== recipe.recipeId));
            setSuccess(`"${recipe.title}" approved and is now live.`);
            refreshCount();
        } catch (err) {
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
            setSuccess("");
            await rejectRecipe(recipe.recipeId, rejectReason.trim(), storedUser);
            setRecipes(prev => prev.filter(r => r.recipeId !== recipe.recipeId));
            setRejectingRecipe(null);
            setRejectReason("");
            setSuccess(`"${recipe.title}" has been rejected.`);
            refreshCount();
        } catch (err) {
            setError(getErrorMessage(err, "Failed to reject recipe."));
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <section id="recipe-approvals" className="dashboard-section">
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

            <div className="dashboard-section-header">
                <div>
                    <p className="dashboard-section-kicker">Admin Area</p>
                    <h2>Pending Recipe Approvals</h2>
                </div>
                <p>Review submitted recipes and approve or reject them.</p>
            </div>

            {error && (
                <div className="admin-queue-message admin-queue-message--error">{error}</div>
            )}
            {success && (
                <div className="admin-queue-message admin-queue-message--success">{success}</div>
            )}

            {loading ? (
                <p style={{ color: "#55705d", fontWeight: 700 }}>Loading pending recipes…</p>
            ) : recipes.length === 0 ? (
                <div className="dashboard-empty-state">
                    <span>✓</span>
                    <p>Queue is empty — all submitted recipes have been reviewed.</p>
                </div>
            ) : (
                <div className="admin-queue-list">
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
                                            {recipe.instructions}
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
                                        {isProcessing ? "Processing…" : "Approve"}
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
                </div>
            )}
        </section>
    );
}

export default AdminRecipeApprovalSection;
