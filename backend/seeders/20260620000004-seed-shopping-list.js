"use strict";

const shoppingData = require("../data/shoppingList.json");

module.exports = {
    async up(queryInterface) {
        const rows = shoppingData.map(item => ({
            shoppingItemId: item.shoppingItemId,
            userId:         item.userId,
            ingredientId:   item.ingredientId,
            quantity:       item.quantity,
            unit:           item.unit,
            completed:      item.completed,
            source:         item.source || null,
            createDate:     new Date(item.createDate),
            updateDate:     new Date(item.updateDate)
        }));

        await queryInterface.bulkInsert("ShoppingList", rows, {});
    },

    async down(queryInterface, Sequelize) {
        const seededIds = shoppingData.map(item => item.shoppingItemId);

        await queryInterface.bulkDelete(
            "ShoppingList",
            { shoppingItemId: { [Sequelize.Op.in]: seededIds } },
            {}
        );
    }
};
