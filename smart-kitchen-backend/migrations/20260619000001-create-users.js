"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Users", {
            userId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            firstName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            userRole: {
                type: Sequelize.ENUM("user", "chef", "influencer", "admin"),
                allowNull: false,
                defaultValue: "user"
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            cookingLevel: {
                type: Sequelize.ENUM("beginner", "intermediate", "advanced"),
                allowNull: false,
                defaultValue: "beginner"
            },
            age: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            preferences: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null
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

        // MySQL 8.0.16+ enforces CHECK constraints (this installation is 8.0.46).
        await queryInterface.sequelize.query(
            "ALTER TABLE Users ADD CONSTRAINT chk_users_age CHECK (age BETWEEN 1 AND 120)"
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Users");
    }
};
