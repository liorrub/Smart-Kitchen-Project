import "./AdminReviewControl.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePendingRecipes } from "../context/PendingRecipeContext";
import { getUserRole } from "../utils/authUtils";

function AdminReviewControl() {
    const { user } = useAuth();
    const { pendingCount } = usePendingRecipes();
    const navigate = useNavigate();

    if (getUserRole(user) !== "admin") return null;

    const label = pendingCount === 1
        ? "1 pending recipe request"
        : `${pendingCount} pending recipe requests`;

    return (
        <button
            type="button"
            className={`admin-review-btn${pendingCount === 0 ? " admin-review-btn--empty" : ""}`}
            onClick={() => navigate("/dashboard#recipe-approvals")}
            aria-label={label}
            title={label}
        >
            <span className="admin-review-icon" aria-hidden="true">📋</span>
            <span className="admin-review-badge" aria-hidden="true">{pendingCount}</span>
        </button>
    );
}

export default AdminReviewControl;
