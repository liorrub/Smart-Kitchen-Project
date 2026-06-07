import "./ReviewCard.css";

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
    Receives a review object and displays review details.
*/
function ReviewCard({ review }) {
    return (
        <article className="review-card">
            <div className="review-card-header">
                <div className="review-card-user-row">
                    <span className="review-card-avatar">
                        U
                    </span>

                    <div>
                        <h4>User #{review.userId}</h4>

                        <p>
                            {formatDate(review.createdAt)}
                        </p>
                    </div>
                </div>

                {review.isInfluencer && (
                    <span className="review-card-influencer">
                        Influencer
                    </span>
                )}
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
                <span>
                    👍 {review.helpfulVotes || 0} helpful votes
                </span>
            </div>
        </article>
    );
}

export default ReviewCard;
