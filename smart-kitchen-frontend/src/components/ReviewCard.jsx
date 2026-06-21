import "./ReviewCard.css";

import AvatarImage from "./AvatarImage";

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
    const author = review.author || {};
    const displayName = author.firstName
        ? `${author.firstName} ${author.lastName || ""}`.trim()
        : `User #${review.userId}`;

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
                        <h4>{displayName}</h4>
                        {author.username && (
                            <span className="review-card-username">@{author.username}</span>
                        )}
                        <p>
                            {formatDate(review.createdAt)}
                        </p>
                    </div>
                </div>

                {review.isInfluencer && (
                    <span className="review-card-influencer">
                        Foodie
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
