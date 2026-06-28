"use strict";

const reviewsData = require("../data/reviews.json");

module.exports = {
    async up(queryInterface) {
        const rows = reviewsData.map(review => ({
            reviewId:     review.reviewId,
            userId:       review.userId,
            recipeId:     review.recipeId,
            rating:       review.rating,
            title:        review.title,
            comment:      review.comment,
            isInfluencer: review.isInfluencer,
            helpfulVotes: 0,
            createdAt:    new Date(review.createdAt),
            updatedAt:    new Date(review.createdAt)
        }));

        await queryInterface.bulkInsert("Reviews", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = reviewsData.map(review => review.reviewId);

        await queryInterface.bulkDelete(
            "Reviews",
            { reviewId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
