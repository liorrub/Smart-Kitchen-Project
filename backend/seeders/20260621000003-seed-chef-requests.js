"use strict";

const chefRequestsData = require("../data/chefRequests.json");

module.exports = {
    async up(queryInterface) {
        const rows = chefRequestsData.map((item) => ({
            requestId: item.requestId,
            userId: item.userId,
            status: item.status,
            reason: item.reason,
            requestDate: new Date(item.requestDate),
            reviewedDate: item.reviewedDate ? new Date(item.reviewedDate) : null,
            reviewedBy: item.reviewedBy !== undefined ? item.reviewedBy : null
        }));

        await queryInterface.bulkInsert("ChefRequests", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = chefRequestsData.map((item) => item.requestId);
        await queryInterface.bulkDelete(
            "ChefRequests",
            { requestId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
