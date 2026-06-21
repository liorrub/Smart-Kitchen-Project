"use strict";

const userFollowsData = require("../data/userFollows.json");

module.exports = {
    async up(queryInterface) {
        const rows = userFollowsData.map(follow => ({
            followId:   follow.followId,
            followerId: follow.followerId,
            followeeId: follow.followeeId,
            createdAt:  new Date(follow.createdAt),
            updatedAt:  new Date(follow.createdAt)
        }));

        await queryInterface.bulkInsert("UserFollows", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = userFollowsData.map(follow => follow.followId);

        await queryInterface.bulkDelete(
            "UserFollows",
            { followId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
