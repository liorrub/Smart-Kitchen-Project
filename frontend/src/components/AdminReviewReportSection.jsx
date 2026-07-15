import "./AdminReviewReportSection.css";

import { useEffect, useState } from "react";

import { getReviewReports, updateReviewReport, deleteReviewThroughModeration } from "../services/reviewsService";
import { useReviewReports } from "../context/ReviewReportContext";

const STATUS_LABELS = {
    open: "Open",
    dismissed: "Dismissed",
    actioned: "Actioned"
};

const REASON_LABELS = {
    spam: "Spam or advertising",
    inappropriate: "Inappropriate content",
    harassment: "Harassment or abuse",
    misinformation: "Misinformation",
    "off-topic": "Off-topic or irrelevant",
    other: "Other"
};

function formatDate(value) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function AdminReviewReportSection() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("open");
    const [actionMessage, setActionMessage] = useState({ text: "", type: "" });
    const { refreshCount } = useReviewReports();

    async function loadReports() {
        try {
            setLoading(true);
            setError("");
            const data = await getReviewReports(statusFilter);
            setReports(Array.isArray(data) ? data : []);
        } catch {
            setError("Failed to load review reports.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    async function handleUpdateStatus(reportId, newStatus) {
        try {
            await updateReviewReport(reportId, { status: newStatus });
            setActionMessage({ text: `Report marked as ${newStatus}.`, type: "success" });
            setTimeout(() => setActionMessage({ text: "", type: "" }), 3000);
            await loadReports();
            await refreshCount();
        } catch {
            setActionMessage({ text: "Failed to update report status.", type: "error" });
            setTimeout(() => setActionMessage({ text: "", type: "" }), 3000);
        }
    }

    async function handleDeleteReview(reportId) {
        try {
            await deleteReviewThroughModeration(reportId);
            setActionMessage({ text: "Review deleted through moderation.", type: "success" });
            setTimeout(() => setActionMessage({ text: "", type: "" }), 3000);
            await loadReports();
            await refreshCount();
        } catch {
            setActionMessage({ text: "Failed to delete review.", type: "error" });
            setTimeout(() => setActionMessage({ text: "", type: "" }), 3000);
        }
    }

    return (
        <section id="review-reports" className="dashboard-section">
            <h2 className="dashboard-section-title">Review Reports</h2>
            <p className="dashboard-section-desc">
                Review flagged content and take moderation action.
            </p>

            <div className="rr-filter-row">
                {["open", "dismissed", "actioned"].map((s) => (
                    <button
                        key={s}
                        type="button"
                        className={`rr-filter-btn${statusFilter === s ? " rr-filter-btn--active" : ""}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {STATUS_LABELS[s]}
                    </button>
                ))}
            </div>

            {actionMessage.text && (
                <p className={`rr-action-message rr-action-message--${actionMessage.type}`}>
                    {actionMessage.text}
                </p>
            )}

            {loading && <p className="rr-state">Loading reports...</p>}
            {!loading && error && <p className="rr-state rr-state--error">{error}</p>}
            {!loading && !error && reports.length === 0 && (
                <p className="rr-state">No {statusFilter} reports.</p>
            )}

            {!loading && !error && reports.length > 0 && (
                <div className="rr-list">
                    {reports.map((report) => (
                        <div key={report.reportId} className="rr-card">
                            <div className="rr-card-body">
                                <div className="rr-card-meta">
                                    <span className={`rr-status rr-status--${report.status}`}>
                                        {STATUS_LABELS[report.status]}
                                    </span>
                                    <span className="rr-reason">
                                        {REASON_LABELS[report.reason] || report.reason}
                                    </span>
                                    <span className="rr-date">{formatDate(report.createdAt)}</span>
                                </div>

                                <p className="rr-card-reporter">
                                    Reported by{" "}
                                    <strong>
                                        {report.reporter
                                            ? `${report.reporter.firstName} ${report.reporter.lastName}`
                                            : `User #${report.reporterUserId}`}
                                    </strong>
                                    {report.reporter?.username && (
                                        <> (@{report.reporter.username})</>
                                    )}
                                </p>

                                {report.details && (
                                    <p className="rr-card-details">"{report.details}"</p>
                                )}

                                {report.review && (
                                    <div className="rr-card-review-preview">
                                        <strong>{report.review.title}</strong>
                                        {report.review.comment && (
                                            <p>{report.review.comment}</p>
                                        )}
                                    </div>
                                )}

                                {report.moderator && (
                                    <p className="rr-card-moderated">
                                        Actioned by {report.moderator.firstName} {report.moderator.lastName} on {formatDate(report.reviewedAt)}
                                    </p>
                                )}
                            </div>

                            {report.status === "open" && (
                                <div className="rr-card-actions">
                                    <button
                                        type="button"
                                        className="rr-action-btn rr-action-btn--dismiss"
                                        onClick={() => handleUpdateStatus(report.reportId, "dismissed")}
                                    >
                                        Dismiss
                                    </button>
                                    <button
                                        type="button"
                                        className="rr-action-btn rr-action-btn--action"
                                        onClick={() => handleUpdateStatus(report.reportId, "actioned")}
                                    >
                                        Mark Actioned
                                    </button>
                                    <button
                                        type="button"
                                        className="rr-action-btn rr-action-btn--delete"
                                        onClick={() => handleDeleteReview(report.reportId)}
                                    >
                                        Delete Review
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default AdminReviewReportSection;
