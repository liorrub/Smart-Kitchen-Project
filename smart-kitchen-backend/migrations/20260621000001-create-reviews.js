"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Reviews", {
            reviewId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Users", key: "userId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            recipeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Recipes", key: "recipeId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            rating: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            isInfluencer: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            helpfulVotes: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
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

        await queryInterface.addIndex("Reviews", ["recipeId"], {
            name: "reviews_recipe_idx"
        });

        await queryInterface.addIndex("Reviews", ["userId"], {
            name: "reviews_user_idx"
        });

        await queryInterface.addIndex("Reviews", ["userId", "recipeId"], {
            name: "reviews_user_recipe_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("Reviews");
    }
};
