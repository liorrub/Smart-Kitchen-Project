import "./ReviewForm.css";

import { useState } from "react";

import StarRating from "./StarRating";

function ReviewForm({ initial = null, onSubmit, onCancel, loading = false }) {
    const [rating, setRating] = useState(initial?.rating || 0);
    const [title, setTitle] = useState(initial?.title || "");
    const [comment, setComment] = useState(initial?.comment || "");
    const [error, setError] = useState("");

    function validate() {
        if (!rating) return "Please select a star rating.";
        if (!title.trim()) return "Please enter a review title.";
        if (!comment.trim()) return "Please write a review comment.";
        return "";
    }

    function handleSubmit(e) {
        e.preventDefault();
        const msg = validate();
        if (msg) {
            setError(msg);
            return;
        }
        setError("");
        onSubmit({ rating, title: title.trim(), comment: comment.trim() });
    }

    const isEditing = !!initial;

    return (
        <form className="review-form" onSubmit={handleSubmit} noValidate>
            <h4 className="review-form-heading">
                {isEditing ? "Edit your review" : "Write a review"}
            </h4>

            <div className="review-form-stars">
                <span className="review-form-label">Your rating</span>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                    <span className="review-form-rating-label">{rating} / 5</span>
                )}
            </div>

            <div className="review-form-field">
                <label htmlFor="review-title" className="review-form-label">Title</label>
                <input
                    id="review-title"
                    type="text"
                    className="review-form-input"
                    placeholder="Summarize your review"
                    value={title}
                    maxLength={255}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div className="review-form-field">
                <label htmlFor="review-comment" className="review-form-label">Review</label>
                <textarea
                    id="review-comment"
                    className="review-form-textarea"
                    placeholder="Share your experience with this recipe..."
                    value={comment}
                    rows={4}
                    onChange={(e) => setComment(e.target.value)}
                />
            </div>

            {error && <p className="review-form-error" role="alert">{error}</p>}

            <div className="review-form-actions">
                {onCancel && (
                    <button
                        type="button"
                        className="review-form-btn review-form-btn--cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="review-form-btn review-form-btn--submit"
                    disabled={loading}
                >
                    {loading ? "Saving..." : isEditing ? "Save changes" : "Post review"}
                </button>
            </div>
        </form>
    );
}

export default ReviewForm;
