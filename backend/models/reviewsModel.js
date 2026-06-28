"use strict";

const { Review, User, ReviewHelpfulVote, ReviewReport } = require("./index");

const AUTHOR_ATTRIBUTES = ["userId", "firstName", "lastName", "username", "avatarKey", "userRole"];

// Strips updatedAt — the original Reviews API never exposed it.
function toPlain(instance) {
    const { updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

// For list display — includes reviewer data and renames reviewer → author
// so the frontend ReviewCard.jsx (which reads review.author) gets real identity.
function toPlainWithAuthor(instance) {
    const { updatedAt, reviewer, ...rest } = instance.get({ plain: true });
    return { ...rest, author: reviewer || null };
}

// Get reviews for a recipe, with author data and the current user's helpful-vote status.
async function getReviewsByRecipeId(recipeId, currentUserId) {
    const rows = await Review.findAll({
        where: { recipeId },
        include: [{
            model: User,
            as: "reviewer",
            attributes: AUTHOR_ATTRIBUTES
        }],
        order: [["reviewId", "ASC"]]
    });

    // One batched query for helpful votes by the current user (avoids N+1)
    let votedSet = new Set();
    if (currentUserId && rows.length > 0) {
        const reviewIds = rows.map(r => r.reviewId);
        const votes = await ReviewHelpfulVote.findAll({
            where: { reviewId: reviewIds, userId: currentUserId },
            attributes: ["reviewId"]
        });
        votedSet = new Set(votes.map(v => v.reviewId));
    }

    return rows.map(row => ({
        ...toPlainWithAuthor(row),
        viewerHasMarkedHelpful: votedSet.has(row.reviewId)
    }));
}

// Get review by ID (for ownership check in update/delete — no author needed)
async function getReviewById(reviewId) {
    const instance = await Review.findByPk(reviewId);
    return instance ? toPlain(instance) : undefined;
}

// Check whether a user has already reviewed a recipe (for duplicate prevention)
async function findExistingReview(userId, recipeId) {
    const instance = await Review.findOne({ where: { userId, recipeId } });
    return instance ? toPlain(instance) : null;
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

// Toggle a helpful vote for a review. Returns { viewerHasMarkedHelpful, helpfulCount }.
async function toggleHelpfulVote(reviewId, userId) {
    const existing = await ReviewHelpfulVote.findOne({ where: { reviewId, userId } });

    if (existing) {
        await existing.destroy();
        await Review.decrement("helpfulVotes", { where: { reviewId } });
        const updated = await Review.findByPk(reviewId, { attributes: ["helpfulVotes"] });
        return { viewerHasMarkedHelpful: false, helpfulCount: updated ? updated.helpfulVotes : 0 };
    }

    await ReviewHelpfulVote.create({ reviewId, userId });
    await Review.increment("helpfulVotes", { where: { reviewId } });
    const updated = await Review.findByPk(reviewId, { attributes: ["helpfulVotes"] });
    return { viewerHasMarkedHelpful: true, helpfulCount: updated ? updated.helpfulVotes : 0 };
}

// Create a review report
async function createReport(data) {
    const instance = await ReviewReport.create(data);
    return instance.get({ plain: true });
}

// Find an existing report by the same user for the same review (for duplicate prevention)
async function findExistingReport(reviewId, reporterUserId) {
    const instance = await ReviewReport.findOne({
        where: { reviewId, reporterUserId, status: "open" }
    });
    return instance ? instance.get({ plain: true }) : null;
}

// Get all review reports (admin), optionally filtered by status
async function getReports({ status } = {}) {
    const where = status ? { status } : {};
    const rows = await ReviewReport.findAll({
        where,
        include: [
            { model: User, as: "reporter", attributes: AUTHOR_ATTRIBUTES },
            { model: Review, as: "review", attributes: ["reviewId", "title", "comment", "recipeId", "userId"] },
            { model: User, as: "moderator", attributes: ["userId", "firstName", "lastName"], required: false }
        ],
        order: [["createdAt", "DESC"]]
    });
    return rows.map(r => r.get({ plain: true }));
}

// Update a review report's status (admin action)
async function updateReport(reportId, data) {
    const [count] = await ReviewReport.update(data, { where: { reportId } });
    if (!count) return null;
    const instance = await ReviewReport.findByPk(reportId);
    return instance ? instance.get({ plain: true }) : null;
}

// Get a single report by ID (includes the review for moderation delete)
async function getReportById(reportId) {
    const instance = await ReviewReport.findByPk(reportId, {
        include: [{ model: Review, as: "review", attributes: ["reviewId", "recipeId"] }]
    });
    return instance ? instance.get({ plain: true }) : null;
}

// Count of open review reports — for the admin navbar indicator
async function getOpenReportCount() {
    const count = await ReviewReport.count({ where: { status: "open" } });
    return { count };
}

module.exports = {
    getReviewsByRecipeId,
    getReviewById,
    findExistingReview,
    addReview,
    updateReview,
    deleteReview,
    toggleHelpfulVote,
    createReport,
    findExistingReport,
    getReportById,
    getReports,
    updateReport,
    getOpenReportCount
};
