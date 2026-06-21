"use strict";

const { Review } = require("./index");

// Strips updatedAt — the original Reviews API never exposed it.
function toPlain(instance) {
    const { updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

// Get reviews for recipe
async function getReviewsByRecipeId(recipeId) {
    const rows = await Review.findAll({
        where: { recipeId },
        order: [["reviewId", "ASC"]]
    });
    return rows.map(toPlain);
}

// Get review by ID
async function getReviewById(reviewId) {
    const instance = await Review.findByPk(reviewId);
    return instance ? toPlain(instance) : undefined;
}

// Create a new review. helpfulVotes is always 0 on creation.
async function addReview(reviewData) {
    const instance = await Review.create({ ...reviewData, helpfulVotes: 0 });
    return toPlain(instance);
}

// Update review — matches by both reviewId and recipeId to prevent cross-recipe edits.
async function updateReview(recipeId, reviewId, updatedData) {
    const instance = await Review.findOne({ where: { reviewId, recipeId } });
    if (!instance) return null;
    await instance.update(updatedData);
    return toPlain(instance);
}

// Delete review — matches by both reviewId and recipeId.
async function deleteReview(recipeId, reviewId) {
    const count = await Review.destroy({ where: { reviewId, recipeId } });
    return count > 0;
}

module.exports = {
    getReviewsByRecipeId,
    getReviewById,
    addReview,
    updateReview,
    deleteReview
};
