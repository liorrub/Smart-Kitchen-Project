"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("ShoppingList", {
            shoppingItemId: {
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
            completed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            source: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            createDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updateDate: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex("ShoppingList", ["userId"], {
            name: "shopping_list_user_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("ShoppingList");
    }
};
