"use strict";

// FLOAT stores 4.7 as ~4.699999... which fails >= 4.7 comparisons in MySQL.
// DECIMAL(3,1) stores 4.7 exactly, matching the original in-memory JS behavior.
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("Stores", "rating", {
            type: Sequelize.DECIMAL(3, 1),
            allowNull: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn("Stores", "rating", {
            type: Sequelize.FLOAT,
            allowNull: true
        });
    }
};
