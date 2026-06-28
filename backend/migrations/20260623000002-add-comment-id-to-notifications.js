"use strict";

// Adds a nullable commentId column to Notifications so that reply and mention
// notifications can carry a direct reference to the triggering comment.
// entityId remains the recipeId (navigation target); commentId is supplementary
// context used to scroll to and highlight the specific comment on page load.

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Notifications", "commentId", {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
            references: { model: "RecipeComments", key: "commentId" },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            after: "entityType"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("Notifications", "commentId");
    }
};
