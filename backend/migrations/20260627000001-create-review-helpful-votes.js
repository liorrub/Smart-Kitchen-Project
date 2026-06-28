"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("ReviewHelpfulVotes", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            reviewId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Reviews", key: "reviewId" },
                onDelete: "CASCADE"
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Users", key: "userId" },
                onDelete: "CASCADE"
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex("ReviewHelpfulVotes", ["reviewId", "userId"], {
            unique: true,
            name: "uq_review_helpful_vote"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("ReviewHelpfulVotes");
    }
};
