"use strict";

// Seeded review reports for admin panel demo.
// References reviewIds 1, 3, 7 — all verified to exist in reviews.json.
// reason ENUM: "spam" | "inappropriate" | "harassment" | "misinformation" | "off-topic" | "other"
// status ENUM: "open" | "dismissed" | "actioned"

const SEEDED_IDS = [1, 2, 3];

module.exports = {
    async up(queryInterface) {
        const rows = [
            {
                reportId: 1, reviewId: 1, reporterUserId: 17, reason: "spam",
                details: "This review appears to be copy-pasted from another website.",
                status: "open", reviewedByUserId: null, reviewedAt: null,
                createdAt: new Date("2026-06-20T10:00:00Z"), updatedAt: new Date("2026-06-20T10:00:00Z")
            },
            {
                reportId: 2, reviewId: 3, reporterUserId: 15, reason: "off-topic",
                details: "The review discusses delivery service, not the recipe itself.",
                status: "dismissed", reviewedByUserId: 2, reviewedAt: new Date("2026-06-22T14:00:00Z"),
                createdAt: new Date("2026-06-19T16:00:00Z"), updatedAt: new Date("2026-06-22T14:00:00Z")
            },
            {
                reportId: 3, reviewId: 7, reporterUserId: 19, reason: "inappropriate",
                details: "The language used in this review is offensive and should be removed.",
                status: "actioned", reviewedByUserId: 3, reviewedAt: new Date("2026-06-23T11:00:00Z"),
                createdAt: new Date("2026-06-18T09:00:00Z"), updatedAt: new Date("2026-06-23T11:00:00Z")
            }
        ];

        await queryInterface.bulkInsert("ReviewReports", rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            "ReviewReports",
            { reportId: { [Sequelize.Op.in]: SEEDED_IDS } },
            {}
        );
    }
};
