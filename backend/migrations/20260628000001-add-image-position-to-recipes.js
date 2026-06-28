"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("Recipes", "imagePositionX", {
            type: Sequelize.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 50,
            after: "imageUrl"
        });
        await queryInterface.addColumn("Recipes", "imagePositionY", {
            type: Sequelize.TINYINT.UNSIGNED,
            allowNull: false,
            defaultValue: 50,
            after: "imagePositionX"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("Recipes", "imagePositionX");
        await queryInterface.removeColumn("Recipes", "imagePositionY");
    }
};
