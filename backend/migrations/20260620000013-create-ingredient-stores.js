"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("IngredientStores", {
            ingredientStoreId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            ingredientId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Ingredients", key: "ingredientId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            storeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: "Stores", key: "storeId" },
                onDelete: "CASCADE",
                onUpdate: "CASCADE"
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            lastUpdated: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        await queryInterface.addIndex("IngredientStores", ["ingredientId"], {
            name: "ingredient_store_ingredient_idx"
        });

        await queryInterface.addIndex("IngredientStores", ["storeId"], {
            name: "ingredient_store_store_idx"
        });

        await queryInterface.addIndex(
            "IngredientStores",
            ["ingredientId", "storeId"],
            { name: "ingredient_store_composite_idx" }
        );
    },

    async down(queryInterface) {
        await queryInterface.dropTable("IngredientStores");
    }
};
