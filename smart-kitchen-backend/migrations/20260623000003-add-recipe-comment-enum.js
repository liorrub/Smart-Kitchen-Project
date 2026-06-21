"use strict";

// Adds recipe_comment to the Notifications.type ENUM.
// MySQL requires the full list of values when modifying an ENUM column.
// The new value is inserted between follow and comment_reply to group
// comment-related types together.

module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            `ALTER TABLE Notifications
             MODIFY COLUMN type ENUM(
                 'follow',
                 'recipe_comment',
                 'comment_reply',
                 'mention',
                 'chef_approved',
                 'chef_rejected'
             ) NOT NULL`
        );
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query(
            `ALTER TABLE Notifications
             MODIFY COLUMN type ENUM(
                 'follow',
                 'comment_reply',
                 'mention',
                 'chef_approved',
                 'chef_rejected'
             ) NOT NULL`
        );
    }
};
