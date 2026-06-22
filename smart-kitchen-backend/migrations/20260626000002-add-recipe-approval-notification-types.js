"use strict";

// Extends the Notifications.type ENUM to include recipe_approved and recipe_rejected.
// Uses raw SQL (same pattern as 20260623000003-add-recipe-comment-enum.js) because
// Sequelize changeColumn on an ENUM requires listing all existing values explicitly.
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            `ALTER TABLE Notifications MODIFY COLUMN type ENUM(
                'follow',
                'recipe_comment',
                'comment_reply',
                'mention',
                'chef_approved',
                'chef_rejected',
                'recipe_approved',
                'recipe_rejected'
            ) NOT NULL`
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            `ALTER TABLE Notifications MODIFY COLUMN type ENUM(
                'follow',
                'recipe_comment',
                'comment_reply',
                'mention',
                'chef_approved',
                'chef_rejected'
            ) NOT NULL`
        );
    }
};
