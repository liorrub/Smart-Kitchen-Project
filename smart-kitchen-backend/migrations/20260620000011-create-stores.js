"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Stores", {
            storeId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            address: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            rating: {
                type: Sequelize.FLOAT,
                allowNull: true
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

        await queryInterface.addIndex("Stores", ["city"], {
            name: "stores_city_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("Stores");
    }
};
