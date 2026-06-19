"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Ingredients", {
            ingredientId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            category: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            isAllergen: {
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Ingredients");
    }
};
