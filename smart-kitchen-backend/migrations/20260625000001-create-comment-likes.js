"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("CommentLikes", {
            commentLikeId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            commentId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "RecipeComments",
                    key: "commentId"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
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

        // Unique constraint: one like per user per comment
        await queryInterface.addIndex("CommentLikes", ["userId", "commentId"], {
            unique: true,
            name: "comment_likes_user_comment_unique"
        });

        // Individual indexes for efficient lookups
        await queryInterface.addIndex("CommentLikes", ["userId"], {
            name: "comment_likes_user_idx"
        });

        await queryInterface.addIndex("CommentLikes", ["commentId"], {
            name: "comment_likes_comment_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("CommentLikes");
    }
};
