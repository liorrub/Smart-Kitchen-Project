const reviews = require("../data/reviews.json");

const { generateId } = require("../utils/idGenerator");
const { getCurrentDateTime } = require("../utils/dateHelper");

// Get reviews for recipe
async function getReviewsByRecipeId(recipeId) {
    return reviews.filter(
        review => review.recipeId === recipeId
    );
}

// Get review by ID
async function getReviewById(reviewId) {
    return reviews.find(
        review => review.reviewId === reviewId
    );
}

// Create a new review with default helpful votes count
async function addReview(reviewData) {
    const newReview = {
        reviewId: generateId(
            reviews,
            "reviewId"
        ),
        ...reviewData,
        helpfulVotes: 0,
        createdAt: getCurrentDateTime()
    };

    reviews.push(newReview);

    return newReview;
}

// Update review
async function updateReview(
    recipeId,
    reviewId,
    updatedData
) {
    const reviewIndex = reviews.findIndex(
        review =>
            review.reviewId === reviewId &&
            review.recipeId === recipeId
    );

    if (reviewIndex === -1) {
        return null;
    }

    reviews[reviewIndex] = {
        ...reviews[reviewIndex],
        ...updatedData
    };

    return reviews[reviewIndex];
}

// Delete review
async function deleteReview(
    recipeId,
    reviewId
) {
    const reviewIndex = reviews.findIndex(
        review =>
            review.reviewId === reviewId &&
            review.recipeId === recipeId
    );

    if (reviewIndex === -1) {
        return false;
    }

    reviews.splice(reviewIndex, 1);

    return true;
}

module.exports = {
    getReviewsByRecipeId,
    getReviewById,
    addReview,
    updateReview,
    deleteReview
};