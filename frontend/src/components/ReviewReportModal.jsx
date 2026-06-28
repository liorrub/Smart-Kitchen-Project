import "./ReviewReportModal.css";

import { useState, useRef, useEffect } from "react";

import CustomSelect from "./CustomSelect";

const REPORT_REASONS = [
    { value: "spam", label: "Spam or advertising" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "harassment", label: "Harassment or abuse" },
    { value: "misinformation", label: "Misinformation or false claims" },
    { value: "off-topic", label: "Off-topic or irrelevant" },
    { value: "other", label: "Other" }
];

function ReviewReportModal({ onSubmit, onClose, loading = false, submitError = "", submitSuccess = false }) {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");
    const [error, setError] = useState("");
    // Ref-based guard: prevents any second onSubmit() call even if React hasn't
    // re-rendered yet to flip the disabled prop on the button.
    const submittingRef = useRef(false);

    // When the parent signals loading is done (error path), allow retry.
    useEffect(() => {
        if (!loading) {
            submittingRef.current = false;
        }
    }, [loading]);

    function handleReasonChange(e) {
        setReason(e.target.value);
        if (error) setError("");
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (loading || submittingRef.current) return;
        if (!reason) {
            setError("Please select a reason.");
            return;
        }
        if (reason === "other" && !details.trim()) {
            setError("Please provide details when selecting 'Other'.");
            return;
        }
        setError("");
        submittingRef.current = true;
        onSubmit({ reason, details: details.trim() || undefined });
    }

    return (
        <div
            className="report-modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Report review"
        >
            <div
                className="report-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="report-modal-title">Report this review</h3>

                {submitSuccess ? (
                    <p className="report-modal-success" role="status">
                        Thank you. The review was reported for admin review.
                    </p>
                ) : (
                    <>
                        <p className="report-modal-desc">
                            Help us keep reviews honest and respectful by reporting content that violates
                            community guidelines.
                        </p>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="report-modal-field">
                                <CustomSelect
                                    label="Reason"
                                    name="reason"
                                    value={reason}
                                    onChange={handleReasonChange}
                                    options={REPORT_REASONS}
                                    placeholder="Select a reason…"
                                />
                            </div>

                            <div className="report-modal-field">
                                <label htmlFor="report-details" className="report-modal-label">
                                    Additional details{reason === "other" ? " (required)" : " (optional)"}
                                </label>
                                <textarea
                                    id="report-details"
                                    className="report-modal-textarea"
                                    placeholder="Provide any extra context..."
                                    rows={3}
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                />
                            </div>

                            {error && (
                                <p className="report-modal-error" role="alert">{error}</p>
                            )}
                            {submitError && (
                                <p className="report-modal-error" role="alert">{submitError}</p>
                            )}

                            <div className="report-modal-actions">
                                <button
                                    type="button"
                                    className="report-modal-btn report-modal-btn--cancel"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="report-modal-btn report-modal-btn--submit"
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Submit report"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default ReviewReportModal;
