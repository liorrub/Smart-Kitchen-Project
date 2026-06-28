import "./ReviewCard.css";

import { useState } from "react";

import AvatarImage from "./AvatarImage";
import ReviewReportModal from "./ReviewReportModal";

function formatDate(value) {
    if (!value) {
        return "Unknown date";
    }

    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function renderStars(rating) {
    const safeRating = Math.max(
        0,
        Math.min(5, Number(rating) || 0)
    );

    return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

/*
    Reusable review card.
    Props:
      review        — review object (includes author, viewerHasMarkedHelpful, helpfulCount)
      currentUser   — logged-in user (optional); enables owner actions and voting
      onEdit        — called with (review) when the owner clicks Edit
      onDelete      — called with (review) when the owner clicks Delete
      onHelpfulVote — called with (reviewId) to toggle the helpful vote
      onReport      — called with (reviewId, data) to submit a flagging report
*/
function ReviewCard({ review, currentUser, onEdit, onDelete, onHelpfulVote, onReport }) {
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportSuccess, setReportSuccess] = useState(false);
    const [reportError, setReportError] = useState("");

    const author = review.author || {};
    const displayHandle = (author && author.username)
        ? `@${author.username}`
        : `User #${review.userId}`;

    const isOwner = currentUser && review.userId === currentUser.userId;
    const canModify = isOwner;
    const canVote = currentUser && !isOwner;
    const canReport = currentUser && !isOwner;

    async function handleReport(data) {
        if (!onReport) return;
        setReportLoading(true);
        setReportError("");
        try {
            await onReport(review.reviewId, data);
            setReportSuccess(true);
            setTimeout(() => {
                setShowReportModal(false);
                setReportSuccess(false);
            }, 5000);
            // Do NOT reset loading here — keeps the submit button disabled during the
            // 1.5 s success window so a second request cannot be sent.
        } catch (err) {
            const status = err?.response?.status;
            const serverMsg = err?.response?.data?.error;
            let msg;
            if (status === 409) {
                msg = "You have already reported this review.";
            } else if (status === 403) {
                msg = serverMsg || "You are not allowed to report this review.";
            } else if (status === 400) {
                msg = serverMsg || "Invalid report submission.";
            } else {
                msg = "Failed to submit the report. Please try again.";
            }
            setReportError(msg);
            setReportLoading(false); // Re-enable only on failure so the user can correct and retry.
        }
    }

    return (
        <article className="review-card">
            <div className="review-card-header">
                <div className="review-card-user-row">
                    <AvatarImage
                        avatarKey={author.avatarKey}
                        firstName={author.firstName}
                        lastName={author.lastName}
                        size="sm"
                        className="review-card-avatar"
                    />

                    <div>
                        <h4>{displayHandle}</h4>
                        <p>
                            {formatDate(review.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="review-card-header-right">
                    {author.userRole === "influencer" && (
                        <span className="review-card-influencer">
                            Foodie
                        </span>
                    )}

                    {canModify && (
                        <div className="review-card-owner-actions">
                            {onEdit && (
                                <button
                                    type="button"
                                    className="review-card-action-btn review-card-action-btn--edit"
                                    onClick={() => onEdit(review)}
                                    title="Edit review"
                                    aria-label="Edit review"
                                >
                                    ✏️
                                </button>
                            )}
                            {onDelete && (
                                <button
                                    type="button"
                                    className="review-card-action-btn review-card-action-btn--delete"
                                    onClick={() => onDelete(review)}
                                    title="Delete review"
                                    aria-label="Delete review"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="review-card-rating">
                <span>{renderStars(review.rating)}</span>
                <strong>{review.rating}/5</strong>
            </div>

            <h5>{review.title}</h5>

            <p className="review-card-comment">
                {review.comment}
            </p>

            <div className="review-card-footer">
                {canVote && onHelpfulVote ? (
                    <button
                        type="button"
                        className={`review-card-helpful-btn${review.viewerHasMarkedHelpful ? " review-card-helpful-btn--active" : ""}`}
                        onClick={() => onHelpfulVote(review.reviewId)}
                        title={review.viewerHasMarkedHelpful ? "Remove helpful vote" : "Mark as helpful"}
                        aria-label={review.viewerHasMarkedHelpful ? "Remove helpful vote" : "Mark as helpful"}
                        aria-pressed={review.viewerHasMarkedHelpful}
                    >
                        👍 Helpful · {review.helpfulCount || 0}
                    </button>
                ) : (
                    <span className="review-card-helpful-static">
                        👍 Helpful · {review.helpfulCount || 0}
                    </span>
                )}

                {canReport && onReport && !reportSuccess && (
                    <button
                        type="button"
                        className="review-card-report-btn"
                        onClick={() => {
                            setShowReportModal(true);
                            setReportError("");
                        }}
                        title="Report this review"
                        aria-label="Report this review"
                    >
                        🚩 Report
                    </button>
                )}
                {reportSuccess && (
                    <span className="review-card-report-sent">✓ Reported</span>
                )}
            </div>

            {showReportModal && (
                <ReviewReportModal
                    onSubmit={handleReport}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportError("");
                    }}
                    loading={reportLoading}
                    submitError={reportError}
                    submitSuccess={reportSuccess}
                />
            )}
        </article>
    );
}

export default ReviewCard;
