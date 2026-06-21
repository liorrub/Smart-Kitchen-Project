"use strict";

// One-off script to populate username and avatarKey for all seeded users
// in the live smart_kitchen_enriched database AFTER the migration has been run.
//
// Usernames follow the natural  firstName_lastName  format (lowercase, normalized).
// AvatarKeys reference the approved PNG catalog at src/assets/avatars/<key>.png.
//
// Usage (run from smart-kitchen-backend/):
//   node scripts/sync-username-avatar.js

require("dotenv").config();
const sequelize = require("../config/database");

const USERS = [
    { userId: 1,  username: "lior_rubinshtein", avatarKey: "chef_masculine" },
    { userId: 2,  username: "ellen_levin",       avatarKey: "feminine" },
    { userId: 3,  username: "noa_cohen",         avatarKey: "feminine" },
    { userId: 4,  username: "daniel_levi",       avatarKey: "masculine" },
    { userId: 5,  username: "maya_david",        avatarKey: "chef_feminine" },
    { userId: 6,  username: "shir_mizrahi",      avatarKey: "foodie_feminine" },
    { userId: 7,  username: "avi_shapiro",       avatarKey: "chef_masculine" },
    { userId: 8,  username: "tali_ben_david",    avatarKey: "chef_feminine" },
    { userId: 9,  username: "roi_katz",          avatarKey: "chef_masculine" },
    { userId: 10, username: "michal_gross",      avatarKey: "chef_feminine" },
    { userId: 11, username: "yoav_ben_ami",      avatarKey: "chef_masculine" },
    { userId: 12, username: "dana_fischer",      avatarKey: "chef_feminine" },
    { userId: 13, username: "omer_shalev",       avatarKey: "chef_masculine" },
    { userId: 14, username: "rivka_stern",       avatarKey: "feminine" },
    { userId: 15, username: "gal_meirov",        avatarKey: "masculine" },
    { userId: 16, username: "tamar_levy",        avatarKey: "baker_feminine" },
    { userId: 17, username: "itai_barak",        avatarKey: "healthy_masculine" },
    { userId: 18, username: "neta_friedman",     avatarKey: "healthy_feminine" },
    { userId: 19, username: "eran_hazan",        avatarKey: "masculine" },
    { userId: 20, username: "shelly_peretz",     avatarKey: "baker_feminine" },
    { userId: 21, username: "liron_cohen",       avatarKey: "foodie_masculine" },
    { userId: 22, username: "doron_aviram",      avatarKey: "foodie_masculine" },
    { userId: 23, username: "alon_nissim",       avatarKey: "masculine" },
    { userId: 24, username: "meirav_doron",      avatarKey: "feminine" },
    { userId: 25, username: "yaniv_ran",         avatarKey: "healthy_masculine" },
    { userId: 26, username: "sigalit_bar",       avatarKey: "baker_feminine" },
    { userId: 27, username: "kobi_elias",        avatarKey: "masculine" },
    { userId: 28, username: "hila_meir",         avatarKey: "healthy_feminine" },
    { userId: 29, username: "roni_ofer",         avatarKey: "masculine" },
    { userId: 30, username: "shai_landau",       avatarKey: "masculine" },
    { userId: 34, username: "nurit_ilan",        avatarKey: "baker_feminine" },
    { userId: 35, username: "barak_cohen",       avatarKey: "masculine" },
    { userId: 36, username: "ofra_talmi",        avatarKey: "foodie_feminine" },
    { userId: 37, username: "tzachi_ben_tzvi",   avatarKey: "healthy_masculine" },
    { userId: 38, username: "keren_stein",       avatarKey: "baker_feminine" },
    { userId: 39, username: "yael_oren",         avatarKey: "feminine" },
    { userId: 40, username: "amir_davidi",       avatarKey: "healthy_masculine" }
];

async function run() {
    await sequelize.authenticate();
    const t = await sequelize.transaction();
    try {
        for (const { userId, username, avatarKey } of USERS) {
            const [count] = await sequelize.query(
                "UPDATE Users SET username = :username, avatarKey = :avatarKey WHERE userId = :userId",
                { replacements: { username, avatarKey, userId }, transaction: t }
            );
            console.log(`  userId=${userId}: ${count} row(s) → username="${username}" avatarKey="${avatarKey}"`);
        }
        await t.commit();
        console.log(`\nAll ${USERS.length} users synced successfully.`);
    } catch (err) {
        await t.rollback();
        console.error("Sync failed — rolled back:", err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
