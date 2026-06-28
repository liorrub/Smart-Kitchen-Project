"use strict";

// Migration: add `username` (VARCHAR 30, unique, NOT NULL) and
// `avatarKey` (VARCHAR 50, NOT NULL) to Users.
// Process:
//   1. Add both columns as nullable.
//   2. Backfill username as  firstName_lastName  (lowercase, normalized).
//      Normalization: lowercase, replace non-[a-z0-9] chars with _, collapse __, trim trailing _.
//      Hyphens in compound names (Ben-David) become underscores (ben_david).
//   3. Validate no duplicates remain.
//   4. Backfill avatarKey with the default for existing rows.
//   5. Set both columns NOT NULL.
//   6. Add unique index on username.
// down() removes the index and both columns safely.
//
// Note: after this migration runs, execute  node scripts/sync-username-avatar.js
// to overwrite the backfilled values with the curated per-user assignments.

const AVATAR_DEFAULT = "masculine";

module.exports = {
    async up(queryInterface, Sequelize) {
        // Step 1: add nullable columns
        await queryInterface.addColumn("Users", "username", {
            type: Sequelize.STRING(30),
            allowNull: true,
            defaultValue: null
        });

        await queryInterface.addColumn("Users", "avatarKey", {
            type: Sequelize.STRING(50),
            allowNull: true,
            defaultValue: null
        });

        // Step 2: backfill username as  firstName_lastName  (natural name format).
        // REGEXP_REPLACE requires MySQL 8.0+.
        // Steps applied inline:
        //   a. CONCAT(LOWER(TRIM(firstName)), '_', LOWER(TRIM(lastName)))
        //   b. Replace any char not in [a-z0-9_] with '_' (handles spaces, hyphens, accents, etc.)
        //   c. Collapse runs of '__' down to a single '_'
        //   d. TRIM(TRAILING '_' ...) removes any trailing underscore
        await queryInterface.sequelize.query(`
            UPDATE Users
            SET username = TRIM(TRAILING '_' FROM
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        LOWER(CONCAT(TRIM(firstName), '_', TRIM(lastName))),
                        '[^a-z0-9_]+', '_'
                    ),
                    '__+', '_'
                )
            )
        `);

        // Step 3: verify no duplicate usernames before adding the unique constraint
        const [dupes] = await queryInterface.sequelize.query(`
            SELECT username, COUNT(*) AS cnt
            FROM Users
            GROUP BY username
            HAVING cnt > 1
        `);

        if (dupes.length > 0) {
            throw new Error(
                `Duplicate usernames found before unique constraint: ${JSON.stringify(dupes)}`
            );
        }

        // Step 4: backfill avatarKey with the default for all existing rows
        await queryInterface.sequelize.query(`
            UPDATE Users SET avatarKey = '${AVATAR_DEFAULT}' WHERE avatarKey IS NULL
        `);

        // Step 5: change both columns to NOT NULL
        await queryInterface.changeColumn("Users", "username", {
            type: Sequelize.STRING(30),
            allowNull: false
        });

        await queryInterface.changeColumn("Users", "avatarKey", {
            type: Sequelize.STRING(50),
            allowNull: false
        });

        // Step 6: add unique index on username
        await queryInterface.addIndex("Users", ["username"], {
            unique: true,
            name: "idx_users_username_unique"
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("Users", "idx_users_username_unique").catch(() => {});
        await queryInterface.removeColumn("Users", "username").catch(() => {});
        await queryInterface.removeColumn("Users", "avatarKey").catch(() => {});
    }
};
