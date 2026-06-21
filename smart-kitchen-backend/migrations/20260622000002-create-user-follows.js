"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("UserFollows", {
            followId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            followerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId"
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            followeeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId"
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

        // Prevent duplicate follow pairs
        await queryInterface.addIndex("UserFollows", ["followerId", "followeeId"], {
            unique: true,
            name: "user_follows_pair_unique"
        });

        // Speed up "who follows this user?" queries
        await queryInterface.addIndex("UserFollows", ["followeeId"], {
            name: "user_follows_followee_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("UserFollows");
    }
};
