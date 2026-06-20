"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("PantryItems", {
            pantryItemId: {
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
            ingredientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Ingredients", key: "ingredientId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            quantity: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            unit: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            expiryDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            location: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            isExpired: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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

        await queryInterface.addIndex("PantryItems", ["userId"], {
            name: "pantry_items_user_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("PantryItems");
    }
};
