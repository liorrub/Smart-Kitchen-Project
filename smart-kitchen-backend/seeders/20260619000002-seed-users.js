"use strict";

const bcrypt = require("bcryptjs");
const usersData = require("../data/users.json");

module.exports = {
    async up(queryInterface, Sequelize) {
        const users = await Promise.all(
            usersData.map(async (u) => ({
                userId: u.userId,
                firstName: u.firstName.trim(),
                lastName: u.lastName.trim(),
                email: u.email.trim().toLowerCase(),
                password: await bcrypt.hash(u.password, 10),
                userRole: u.userRole,
                city: u.city.trim(),
                cookingLevel: u.cookingLevel,
                age: u.age,
                preferences:
                    u.preferences == null
                        ? null
                        : JSON.stringify(u.preferences),
                createdAt: new Date(u.createDate),
                updatedAt: new Date(u.updateDate)
            }))
        );

        await queryInterface.bulkInsert("Users", users, {});
    },

    async down(queryInterface, Sequelize) {
        // Delete only the users inserted by this seeder, identified by their seeded emails.
        // An array value in bulkDelete is treated as an IN clause by Sequelize.
        await queryInterface.bulkDelete(
            "Users",
            { email: usersData.map((u) => u.email.trim().toLowerCase()) },
            {}
        );
    }
};
