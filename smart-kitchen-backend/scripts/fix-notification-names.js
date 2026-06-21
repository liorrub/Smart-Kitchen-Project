"use strict";

require("dotenv").config();

const sequelize = require("../config/database");

const UPDATES = [
    { notificationId: 2,  message: "Gal Meirov started following you." },
    { notificationId: 3,  message: "Itai Barak started following you." },
    { notificationId: 4,  message: "Neta Friedman started following you." },
    { notificationId: 5,  message: "Eran Hazan started following you." },
    { notificationId: 7,  message: "Rivka Stern started following you." },
    { notificationId: 8,  message: "Itai Barak started following you." },
    { notificationId: 10, message: "Rivka Stern started following you." },
    { notificationId: 11, message: "Gal Meirov started following you." },
    { notificationId: 12, message: "Tamar Levy started following you." },
    { notificationId: 13, message: "Rivka Stern started following you." },
    { notificationId: 14, message: "Tamar Levy started following you." },
    { notificationId: 15, message: "Gal Meirov started following you." },
    { notificationId: 16, message: "Eran Hazan started following you." },
    { notificationId: 18, message: "Rivka Stern started following you." },
    { notificationId: 20, message: "Tamar Levy started following you." }
];

async function run() {
    await sequelize.authenticate();
    const t = await sequelize.transaction();
    try {
        for (const { notificationId, message } of UPDATES) {
            const [count] = await sequelize.query(
                "UPDATE Notifications SET message = :message WHERE notificationId = :notificationId",
                { replacements: { message, notificationId }, transaction: t }
            );
            console.log(`  id=${notificationId}: ${count} row(s) updated → "${message}"`);
        }
        await t.commit();
        console.log("All 15 notification messages updated successfully.");
    } catch (err) {
        await t.rollback();
        console.error("Update failed — rolled back:", err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
