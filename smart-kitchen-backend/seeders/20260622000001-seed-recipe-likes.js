"use strict";

const recipeLikesData = require("../data/recipeLikes.json");

module.exports = {
    async up(queryInterface) {
        const rows = recipeLikesData.map(like => ({
            likeId:    like.likeId,
            userId:    like.userId,
            recipeId:  like.recipeId,
            createdAt: new Date(like.createdAt),
            updatedAt: new Date(like.createdAt)
        }));

        await queryInterface.bulkInsert("RecipeLikes", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = recipeLikesData.map(like => like.likeId);

        await queryInterface.bulkDelete(
            "RecipeLikes",
            { likeId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
