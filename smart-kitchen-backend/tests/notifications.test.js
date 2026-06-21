/**
 * Notification backend tests — no external test framework required.
 * Uses Node.js built-in `assert` and connects to the real database via Sequelize.
 * Cleans up every row it creates (notificationId > 1000).
 *
 * Run: node tests/notifications.test.js
 */

"use strict";

require("dotenv").config();
const assert = require("assert");

const { sequelize, Notification, User } = require("../models/index");
const {
    createNotification,
    getNotificationsForUser,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead
} = require("../models/notificationsModel");
const { notify } = require("../services/notificationService");

// --- helpers ---

let passed = 0;
let failed = 0;
const createdIds = [];

async function test(name, fn) {
    try {
        await fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
        failed++;
    }
}

async function cleanup() {
    if (createdIds.length === 0) return;
    await Notification.destroy({ where: { notificationId: createdIds } });
}

// Known seeded userIds guaranteed to exist in smart_kitchen_enriched
const RECIPIENT_ID = 4;   // Daniel (user)
const SOURCE_ID    = 1;   // Lior (chef)
const ADMIN_ID     = 2;   // Ellen (admin)

async function run() {
    await sequelize.authenticate();
    console.log("\n── Notification model / API tests ──\n");

    // 1. Notification creation persists
    await test("1. Notification creation persists", async () => {
        const n = await createNotification({
            userId: RECIPIENT_ID,
            type: "follow",
            message: "Test follow notification",
            sourceUserId: SOURCE_ID,
            entityId: SOURCE_ID,
            entityType: "user"
        });
        createdIds.push(n.notificationId);
        assert.ok(n.notificationId, "should have a notificationId");
        assert.strictEqual(n.userId, RECIPIENT_ID);
        assert.strictEqual(n.type, "follow");
        assert.strictEqual(n.isRead, false);
    });

    // 2. Unread count increments
    await test("2. Unread count increments", async () => {
        const before = await getUnreadCount(RECIPIENT_ID);
        const n = await createNotification({
            userId: RECIPIENT_ID,
            type: "mention",
            message: "You were mentioned",
            sourceUserId: SOURCE_ID,
            entityId: 1,
            entityType: "recipe"
        });
        createdIds.push(n.notificationId);
        const after = await getUnreadCount(RECIPIENT_ID);
        assert.strictEqual(after, before + 1, "unread count should increment by 1");
    });

    // 3. Mark one as read works
    await test("3. Mark one as read works", async () => {
        const n = await createNotification({
            userId: RECIPIENT_ID,
            type: "comment_reply",
            message: "Reply test",
            sourceUserId: SOURCE_ID,
            entityId: 1,
            entityType: "recipe"
        });
        createdIds.push(n.notificationId);
        const updated = await markNotificationRead(n.notificationId, RECIPIENT_ID);
        assert.ok(updated, "should return the updated notification");
        assert.strictEqual(updated.isRead, true);
    });

    // 4. Mark all as read works
    await test("4. Mark all as read works", async () => {
        const n = await createNotification({
            userId: RECIPIENT_ID,
            type: "mention",
            message: "Mark-all test",
            sourceUserId: SOURCE_ID,
            entityId: 2,
            entityType: "recipe"
        });
        createdIds.push(n.notificationId);
        await markAllNotificationsRead(RECIPIENT_ID);
        const count = await getUnreadCount(RECIPIENT_ID);
        assert.strictEqual(count, 0, "unread count should be 0 after mark-all-read");
    });

    // 5. A user cannot read another user's notification (returns null)
    await test("5. User cannot read another user's notification", async () => {
        const n = await createNotification({
            userId: RECIPIENT_ID,
            type: "follow",
            message: "Cross-user test",
            sourceUserId: SOURCE_ID,
            entityId: SOURCE_ID,
            entityType: "user"
        });
        createdIds.push(n.notificationId);
        const WRONG_USER = 5;
        const result = await markNotificationRead(n.notificationId, WRONG_USER);
        assert.strictEqual(result, null, "should return null for wrong userId");
        // Original should still be unread
        const original = await Notification.findByPk(n.notificationId);
        assert.strictEqual(original.isRead, false);
    });

    // 6. Notifications return newest first (secondary sort by notificationId DESC)
    await test("6. Notifications return newest-first", async () => {
        // Two notifications created sequentially; auto-increment guarantees id_b > id_a
        const a = await createNotification({ userId: RECIPIENT_ID, type: "follow", message: "First", sourceUserId: SOURCE_ID, entityId: SOURCE_ID, entityType: "user" });
        const b = await createNotification({ userId: RECIPIENT_ID, type: "follow", message: "Second", sourceUserId: SOURCE_ID, entityId: SOURCE_ID, entityType: "user" });
        createdIds.push(a.notificationId, b.notificationId);

        const list = await getNotificationsForUser(RECIPIENT_ID, { limit: 10 });
        const idx_b = list.findIndex(n => n.notificationId === b.notificationId);
        const idx_a = list.findIndex(n => n.notificationId === a.notificationId);
        assert.ok(idx_b < idx_a, `b (id=${b.notificationId}) should appear before a (id=${a.notificationId})`);
    });

    // 7. Limit option is respected
    await test("7. Limit option is respected (max 5 returned)", async () => {
        const list = await getNotificationsForUser(RECIPIENT_ID, { limit: 5 });
        assert.ok(list.length <= 5, `list length (${list.length}) should be <= 5`);
    });

    // 8. sourceUser fields are safe (no password or email)
    await test("8. sourceUser does not expose password or email", async () => {
        const n = await createNotification({
            userId: RECIPIENT_ID,
            type: "follow",
            message: "Safe-fields test",
            sourceUserId: SOURCE_ID,
            entityId: SOURCE_ID,
            entityType: "user"
        });
        createdIds.push(n.notificationId);
        const plain = n.get({ plain: true });
        if (plain.sourceUser) {
            assert.strictEqual(plain.sourceUser.password, undefined, "password must not be in sourceUser");
            assert.strictEqual(plain.sourceUser.email, undefined, "email must not be in sourceUser");
        }
    });

    // 9. notify() skips self-notification (sourceUserId === userId)
    await test("9. notify() skips self-notifications", async () => {
        const before = await getUnreadCount(RECIPIENT_ID);
        // Attempt to notify RECIPIENT_ID from RECIPIENT_ID (same person)
        const result = await notify({
            userId: RECIPIENT_ID,
            type: "follow",
            message: "Self follow",
            sourceUserId: RECIPIENT_ID,
            entityId: RECIPIENT_ID,
            entityType: "user"
        });
        assert.strictEqual(result, null, "should return null for self-notification");
        const after = await getUnreadCount(RECIPIENT_ID);
        assert.strictEqual(after, before, "unread count should not change for self-notification");
    });

    // 10. notify() skips invalid recipient (nonexistent userId)
    await test("10. notify() skips nonexistent recipient", async () => {
        const result = await notify({
            userId: 99999,
            type: "follow",
            message: "Ghost user",
            sourceUserId: SOURCE_ID,
            entityId: SOURCE_ID,
            entityType: "user"
        });
        assert.strictEqual(result, null, "should return null for nonexistent user");
    });

    // 11. Follow creates exactly one notification
    await test("11. Follow creates exactly one notification", async () => {
        const before = await getUnreadCount(RECIPIENT_ID);
        await notify({
            userId: RECIPIENT_ID,
            type: "follow",
            message: `${SOURCE_ID} started following you.`,
            sourceUserId: SOURCE_ID,
            entityId: SOURCE_ID,
            entityType: "user"
        });
        const after = await getUnreadCount(RECIPIENT_ID);
        assert.strictEqual(after, before + 1, "exactly one notification should be created");

        // Clean up this last one
        const last = await Notification.findOne({
            where: { userId: RECIPIENT_ID, type: "follow", message: `${SOURCE_ID} started following you.` },
            order: [["notificationId", "DESC"]]
        });
        if (last) createdIds.push(last.notificationId);
    });

    // 12. Recipient deletion cascades their notifications
    await test("12. Recipient deletion cascades notifications", async () => {
        // Create a throwaway user
        const tmp = await User.create({
            firstName: "TempUser", lastName: "NotifTest",
            email: `notif_test_${Date.now()}@test.example`,
            password: "hashed_placeholder",
            userRole: "user", city: "TestCity",
            cookingLevel: "beginner", age: 25
        });
        const n = await Notification.create({
            userId: tmp.userId, type: "follow", message: "cascade test",
            sourceUserId: SOURCE_ID, entityId: SOURCE_ID, entityType: "user",
            isRead: false, createdAt: new Date(), updatedAt: new Date()
        });
        const savedId = n.notificationId;

        // Deleting the user should cascade-delete the notification
        await tmp.destroy();
        const found = await Notification.findByPk(savedId);
        assert.strictEqual(found, null, "notification should be deleted when recipient is deleted");
    });

    // 13. Source user deletion sets sourceUserId to NULL
    await test("13. Source user deletion sets sourceUserId to NULL", async () => {
        const tmp = await User.create({
            firstName: "TempSource", lastName: "NotifTest",
            email: `notif_source_${Date.now()}@test.example`,
            password: "hashed_placeholder",
            userRole: "user", city: "TestCity",
            cookingLevel: "beginner", age: 25
        });
        const n = await Notification.create({
            userId: RECIPIENT_ID, type: "follow", message: "source nullify test",
            sourceUserId: tmp.userId, entityId: tmp.userId, entityType: "user",
            isRead: false, createdAt: new Date(), updatedAt: new Date()
        });
        createdIds.push(n.notificationId);

        await tmp.destroy();
        await n.reload();
        assert.strictEqual(n.sourceUserId, null, "sourceUserId should be null after source user is deleted");
    });

    // Cleanup
    await cleanup();

    console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
    await sequelize.close();
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(async (err) => {
    console.error("Fatal test error:", err);
    await cleanup().catch(() => {});
    await sequelize.close().catch(() => {});
    process.exit(1);
});
