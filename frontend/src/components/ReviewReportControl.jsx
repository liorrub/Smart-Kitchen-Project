import "./ReviewReportControl.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useReviewReports } from "../context/ReviewReportContext";
import { getUserRole } from "../utils/authUtils";

function ReviewReportControl() {
    const { user } = useAuth();
    const { openCount } = useReviewReports();
    const navigate = useNavigate();

    if (getUserRole(user) !== "admin") return null;

    const label = openCount === 1
        ? "1 open review report"
        : `${openCount} open review reports`;

    return (
        <button
            type="button"
            className={`review-report-btn${openCount === 0 ? " review-report-btn--empty" : ""}`}
            onClick={() => navigate("/dashboard#review-reports")}
            aria-label={label}
            title={label}
        >
            <span className="review-report-icon" aria-hidden="true">🚩</span>
            {openCount > 0 && (
                <span className="review-report-badge" aria-hidden="true">{openCount}</span>
            )}
        </button>
    );
}

export default ReviewReportControl;
