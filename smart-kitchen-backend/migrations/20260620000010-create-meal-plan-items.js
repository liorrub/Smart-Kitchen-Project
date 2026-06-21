"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("MealPlanItems", {
            mealId: {
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
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            mealType: {
                type: Sequelize.ENUM("breakfast", "lunch", "dinner", "snack"),
                allowNull: false
            },
            itemType: {
                type: Sequelize.ENUM("recipe", "ingredient"),
                allowNull: false
            },
            // Polymorphic reference — no FK constraint because itemId references different tables
            // depending on itemType ("recipe" → Recipes, "ingredient" → Ingredients).
            itemId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            calories: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
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

        await queryInterface.addIndex("MealPlanItems", ["userId"], {
            name: "meal_plan_user_idx"
        });

        await queryInterface.addIndex("MealPlanItems", ["userId", "date"], {
            name: "meal_plan_user_date_idx"
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable("MealPlanItems");
    }
};
