"use strict";

// Canonical demo notifications — 48 rows covering follow, chef_approved,
// chef_rejected, comment_reply, and mention types.
// Targets and sources are taken from seeded users and chef requests only.
// down() removes only these canonical rows by notificationId list.
// notificationIds 19 and 29 were removed (belonged to demo userId 32).

const SEEDED_IDS = [
    ...Array.from({ length: 18 }, (_, i) => i + 1),   // 1–18
    20,                                                  // skip 19
    ...Array.from({ length: 8 }, (_, i) => i + 21),   // 21–28
    ...Array.from({ length: 21 }, (_, i) => i + 30),  // 30–50 (38/42/48 now restored — recipe 103 exists)
    ...Array.from({ length: 23 }, (_, i) => i + 51)   // 51–73 (new notifications)
];

const NOW = new Date("2026-06-21T10:00:00Z");
function ago(days, hours = 0) {
    const d = new Date(NOW);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hours);
    return d;
}

module.exports = {
    async up(queryInterface) {
        const rows = [
            // ── Follow notifications (1–20) ─────────────────────────────────────
            // recipient = followee, sourceUserId = follower, entityType = "user"
            { notificationId: 1,  userId: 1,  type: "follow", message: "Daniel Levi started following you.",       sourceUserId: 4,  entityId: 4,  entityType: "user",         isRead: true,  createdAt: ago(27),    updatedAt: ago(27) },
            { notificationId: 2,  userId: 1,  type: "follow", message: "Gal Meirov started following you.",        sourceUserId: 15, entityId: 15, entityType: "user",         isRead: true,  createdAt: ago(27),    updatedAt: ago(27) },
            { notificationId: 3,  userId: 1,  type: "follow", message: "Itai Barak started following you.",        sourceUserId: 17, entityId: 17, entityType: "user",         isRead: true,  createdAt: ago(27),    updatedAt: ago(27) },
            { notificationId: 4,  userId: 1,  type: "follow", message: "Neta Friedman started following you.",     sourceUserId: 18, entityId: 18, entityType: "user",         isRead: true,  createdAt: ago(27),    updatedAt: ago(27) },
            { notificationId: 5,  userId: 1,  type: "follow", message: "Eran Hazan started following you.",        sourceUserId: 19, entityId: 19, entityType: "user",         isRead: false, createdAt: ago(26),    updatedAt: ago(26) },
            { notificationId: 6,  userId: 5,  type: "follow", message: "Daniel Levi started following you.",       sourceUserId: 4,  entityId: 4,  entityType: "user",         isRead: true,  createdAt: ago(26),    updatedAt: ago(26) },
            { notificationId: 7,  userId: 5,  type: "follow", message: "Rivka Stern started following you.",       sourceUserId: 14, entityId: 14, entityType: "user",         isRead: true,  createdAt: ago(26),    updatedAt: ago(26) },
            { notificationId: 8,  userId: 5,  type: "follow", message: "Itai Barak started following you.",        sourceUserId: 17, entityId: 17, entityType: "user",         isRead: false, createdAt: ago(25),    updatedAt: ago(25) },
            { notificationId: 9,  userId: 6,  type: "follow", message: "Daniel Levi started following you.",       sourceUserId: 4,  entityId: 4,  entityType: "user",         isRead: true,  createdAt: ago(25),    updatedAt: ago(25) },
            { notificationId: 10, userId: 6,  type: "follow", message: "Rivka Stern started following you.",       sourceUserId: 14, entityId: 14, entityType: "user",         isRead: true,  createdAt: ago(25),    updatedAt: ago(25) },
            { notificationId: 11, userId: 6,  type: "follow", message: "Gal Meirov started following you.",        sourceUserId: 15, entityId: 15, entityType: "user",         isRead: true,  createdAt: ago(25),    updatedAt: ago(25) },
            { notificationId: 12, userId: 6,  type: "follow", message: "Tamar Levy started following you.",        sourceUserId: 16, entityId: 16, entityType: "user",         isRead: false, createdAt: ago(24),    updatedAt: ago(24) },
            { notificationId: 13, userId: 7,  type: "follow", message: "Rivka Stern started following you.",       sourceUserId: 14, entityId: 14, entityType: "user",         isRead: true,  createdAt: ago(24),    updatedAt: ago(24) },
            { notificationId: 14, userId: 7,  type: "follow", message: "Tamar Levy started following you.",        sourceUserId: 16, entityId: 16, entityType: "user",         isRead: false, createdAt: ago(24),    updatedAt: ago(24) },
            { notificationId: 15, userId: 8,  type: "follow", message: "Gal Meirov started following you.",        sourceUserId: 15, entityId: 15, entityType: "user",         isRead: true,  createdAt: ago(24),    updatedAt: ago(24) },
            { notificationId: 16, userId: 8,  type: "follow", message: "Eran Hazan started following you.",        sourceUserId: 19, entityId: 19, entityType: "user",         isRead: false, createdAt: ago(23),    updatedAt: ago(23) },
            { notificationId: 17, userId: 21, type: "follow", message: "Daniel Levi started following you.",       sourceUserId: 4,  entityId: 4,  entityType: "user",         isRead: true,  createdAt: ago(23),    updatedAt: ago(23) },
            { notificationId: 18, userId: 21, type: "follow", message: "Rivka Stern started following you.",       sourceUserId: 14, entityId: 14, entityType: "user",         isRead: false, createdAt: ago(22),    updatedAt: ago(22) },
            { notificationId: 20, userId: 36, type: "follow", message: "Tamar Levy started following you.",        sourceUserId: 16, entityId: 16, entityType: "user",         isRead: false, createdAt: ago(22),    updatedAt: ago(22) },

            // ── Chef approved notifications (21–29) ────────────────────────────
            { notificationId: 21, userId: 5,  type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 2, entityId: 2,  entityType: "chef_request", isRead: true,  createdAt: ago(30),   updatedAt: ago(30) },
            { notificationId: 22, userId: 7,  type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 2, entityId: 4,  entityType: "chef_request", isRead: true,  createdAt: ago(70),   updatedAt: ago(70) },
            { notificationId: 23, userId: 8,  type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 3, entityId: 5,  entityType: "chef_request", isRead: true,  createdAt: ago(68),   updatedAt: ago(68) },
            { notificationId: 24, userId: 9,  type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 2, entityId: 6,  entityType: "chef_request", isRead: true,  createdAt: ago(65),   updatedAt: ago(65) },
            { notificationId: 25, userId: 10, type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 2, entityId: 7,  entityType: "chef_request", isRead: true,  createdAt: ago(62),   updatedAt: ago(62) },
            { notificationId: 26, userId: 11, type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 3, entityId: 8,  entityType: "chef_request", isRead: false, createdAt: ago(60),   updatedAt: ago(60) },
            { notificationId: 27, userId: 12, type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 2, entityId: 9,  entityType: "chef_request", isRead: false, createdAt: ago(58),   updatedAt: ago(58) },
            { notificationId: 28, userId: 13, type: "chef_approved", message: "Your chef request has been approved! You are now a chef.", sourceUserId: 2, entityId: 10, entityType: "chef_request", isRead: false, createdAt: ago(55),   updatedAt: ago(55) },

            // ── Chef rejected notifications (30–34) ────────────────────────────
            { notificationId: 30, userId: 6,  type: "chef_rejected", message: "Your chef request has been reviewed and was not approved at this time.", sourceUserId: 3, entityId: 3,  entityType: "chef_request", isRead: true,  createdAt: ago(25),  updatedAt: ago(25) },
            { notificationId: 31, userId: 14, type: "chef_rejected", message: "Your chef request has been reviewed and was not approved at this time.", sourceUserId: 3, entityId: 12, entityType: "chef_request", isRead: true,  createdAt: ago(44),  updatedAt: ago(44) },
            { notificationId: 32, userId: 15, type: "chef_rejected", message: "Your chef request has been reviewed and was not approved at this time.", sourceUserId: 2, entityId: 13, entityType: "chef_request", isRead: true,  createdAt: ago(41),  updatedAt: ago(41) },
            { notificationId: 33, userId: 16, type: "chef_rejected", message: "Your chef request has been reviewed and was not approved at this time.", sourceUserId: 2, entityId: 14, entityType: "chef_request", isRead: false, createdAt: ago(37),  updatedAt: ago(37) },
            { notificationId: 34, userId: 18, type: "chef_rejected", message: "Your chef request has been reviewed and was not approved at this time.", sourceUserId: 3, entityId: 15, entityType: "chef_request", isRead: true,  createdAt: ago(34),  updatedAt: ago(34) },

            // ── Restored notifications (38/42/48) — needed recipe 103 to exist ──
            { notificationId: 38, userId:  1, type: "comment_reply", message: "Roi Katz replied to your comment.",    sourceUserId:  9, entityId: 103, entityType: "recipe", commentId: 113, isRead: false, createdAt: ago(12), updatedAt: ago(12) },
            { notificationId: 42, userId: 12, type: "comment_reply", message: "Eran Hazan replied to your comment.",  sourceUserId: 19, entityId: 103, entityType: "recipe", commentId: 114, isRead: false, createdAt: ago(11), updatedAt: ago(11) },
            { notificationId: 48, userId:  4, type: "mention",       message: "Roi Katz mentioned you in a comment.", sourceUserId:  9, entityId: 103, entityType: "recipe", commentId: 122, isRead: false, createdAt: ago(9),  updatedAt: ago(9)  },

            // ── Comment reply notifications (35–44) ────────────────────────────
            // entityId = recipeId, entityType = "recipe", commentId = triggering reply commentId
            // Recipe IDs start at 101 in the enriched database (Simple Pasta=101, Tofu Stir-fry=102, etc.)
            // commentIds 109–118 are canonical reply rows seeded in 20260623000003-seed-recipe-comments.js
            { notificationId: 35, userId: 1,  type: "comment_reply", message: "Daniel Levi replied to your comment.",  sourceUserId: 4,  entityId: 101, entityType: "recipe", commentId: 109, isRead: true,  createdAt: ago(10), updatedAt: ago(10) },
            { notificationId: 36, userId: 4,  type: "comment_reply", message: "Gal Meirov replied to your comment.",   sourceUserId: 15, entityId: 101, entityType: "recipe", commentId: 110, isRead: true,  createdAt: ago(9),  updatedAt: ago(9) },
            { notificationId: 37, userId: 5,  type: "comment_reply", message: "Avi Shapiro replied to your comment.",  sourceUserId: 7,  entityId: 102, entityType: "recipe", commentId: 111, isRead: true,  createdAt: ago(9),  updatedAt: ago(9) },
            { notificationId: 39, userId: 8,  type: "comment_reply", message: "Daniel Levi replied to your comment.",  sourceUserId: 4,  entityId: 102, entityType: "recipe", commentId: 112, isRead: false, createdAt: ago(7),  updatedAt: ago(7) },
            { notificationId: 40, userId: 7,  type: "comment_reply", message: "Itai Barak replied to your comment.",   sourceUserId: 17, entityId: 104, entityType: "recipe", commentId: 115, isRead: true,  createdAt: ago(5),  updatedAt: ago(5) },
            { notificationId: 41, userId: 9,  type: "comment_reply", message: "Maya David replied to your comment.",   sourceUserId: 5,  entityId: 105, entityType: "recipe", commentId: 116, isRead: false, createdAt: ago(4),  updatedAt: ago(4) },
            { notificationId: 43, userId: 6,  type: "comment_reply", message: "Daniel Levi replied to your comment.",  sourceUserId: 4,  entityId: 106, entityType: "recipe", commentId: 117, isRead: false, createdAt: ago(2),  updatedAt: ago(2) },
            { notificationId: 44, userId: 1,  type: "comment_reply", message: "Tali Ben-David replied to your comment.", sourceUserId: 8, entityId: 101, entityType: "recipe", commentId: 118, isRead: false, createdAt: ago(1), updatedAt: ago(1) },

            // ── Mention notifications (45–50) ──────────────────────────────────
            // commentIds 119–124 are canonical mention rows seeded in 20260623000003-seed-recipe-comments.js
            { notificationId: 45, userId: 7,  type: "mention", message: "Daniel Levi mentioned you in a comment.", sourceUserId: 4,  entityId: 101, entityType: "recipe", commentId: 119, isRead: true,  createdAt: ago(8),    updatedAt: ago(8) },
            { notificationId: 46, userId: 5,  type: "mention", message: "Gal Meirov mentioned you in a comment.", sourceUserId: 15, entityId: 102, entityType: "recipe", commentId: 120, isRead: false, createdAt: ago(6),    updatedAt: ago(6) },
            { notificationId: 47, userId: 12, type: "mention", message: "Itai Barak mentioned you in a comment.", sourceUserId: 17, entityId: 104, entityType: "recipe", commentId: 121, isRead: true,  createdAt: ago(5),    updatedAt: ago(5) },
            { notificationId: 49, userId: 8,  type: "mention", message: "Eran Hazan mentioned you in a comment.", sourceUserId: 19, entityId: 105, entityType: "recipe", commentId: 123, isRead: false, createdAt: ago(2),    updatedAt: ago(2) },
            { notificationId: 50, userId: 1,  type: "mention", message: "Shir Mizrahi mentioned you in a comment.", sourceUserId: 6, entityId: 106, entityType: "recipe", commentId: 124, isRead: false, createdAt: ago(1, 2), updatedAt: ago(1, 2) },

            // ── New recipe_comment notifications (51–58) ────────────────────────
            // Fires when someone comments on a recipe; userId = recipe creator
            { notificationId: 51, userId:  1, type: "recipe_comment", message: "Daniel Levi commented on your recipe.",    sourceUserId:  4, entityId: 103, entityType: "recipe", commentId: 125, isRead: false, createdAt: ago(8), updatedAt: ago(8) },
            { notificationId: 52, userId:  1, type: "recipe_comment", message: "Tali Ben-David commented on your recipe.", sourceUserId:  8, entityId: 103, entityType: "recipe", commentId: 126, isRead: false, createdAt: ago(7), updatedAt: ago(7) },
            { notificationId: 53, userId:  1, type: "recipe_comment", message: "Avi Shapiro commented on your recipe.",    sourceUserId:  7, entityId: 107, entityType: "recipe", commentId: 127, isRead: true,  createdAt: ago(6), updatedAt: ago(6) },
            { notificationId: 54, userId:  1, type: "recipe_comment", message: "Roi Katz commented on your recipe.",       sourceUserId:  9, entityId: 108, entityType: "recipe", commentId: 128, isRead: true,  createdAt: ago(5), updatedAt: ago(5) },
            { notificationId: 55, userId:  5, type: "recipe_comment", message: "Daniel Levi commented on your recipe.",    sourceUserId:  4, entityId: 113, entityType: "recipe", commentId: 129, isRead: false, createdAt: ago(5), updatedAt: ago(5) },
            { notificationId: 56, userId:  9, type: "recipe_comment", message: "Maya David commented on your recipe.",     sourceUserId:  5, entityId: 116, entityType: "recipe", commentId: 130, isRead: true,  createdAt: ago(4), updatedAt: ago(4) },
            { notificationId: 57, userId:  7, type: "recipe_comment", message: "Itai Barak commented on your recipe.",     sourceUserId: 17, entityId: 118, entityType: "recipe", commentId: 131, isRead: false, createdAt: ago(3), updatedAt: ago(3) },
            { notificationId: 58, userId:  8, type: "recipe_comment", message: "Rivka Stern commented on your recipe.",    sourceUserId: 14, entityId: 122, entityType: "recipe", commentId: 132, isRead: false, createdAt: ago(2), updatedAt: ago(2) },

            // ── New recipe_approved / recipe_rejected notifications (59–62) ──────
            { notificationId: 59, userId:  6, type: "recipe_approved", message: "Your recipe 'Tropical Smoothie Bowl' has been approved!",      sourceUserId: 2, entityId: 178, entityType: "recipe", commentId: null, isRead: true,  createdAt: ago(24), updatedAt: ago(24) },
            { notificationId: 60, userId: 21, type: "recipe_approved", message: "Your recipe 'Overnight Oats with Banana' has been approved!",  sourceUserId: 3, entityId: 179, entityType: "recipe", commentId: null, isRead: true,  createdAt: ago(21), updatedAt: ago(21) },
            { notificationId: 61, userId:  6, type: "recipe_rejected", message: "Your recipe 'Protein Oat Pancakes' was not approved.",         sourceUserId: 2, entityId: 180, entityType: "recipe", commentId: null, isRead: true,  createdAt: ago(27), updatedAt: ago(27) },
            { notificationId: 62, userId: 21, type: "recipe_rejected", message: "Your recipe 'Golden Milk Smoothie' was not approved.",         sourceUserId: 3, entityId: 182, entityType: "recipe", commentId: null, isRead: true,  createdAt: ago(30), updatedAt: ago(30) },

            // ── New follow notifications (63–67) — from 5 new follows ───────────
            { notificationId: 63, userId:  9, type: "follow", message: "Rivka Stern started following you.",  sourceUserId: 14, entityId: 14, entityType: "user", commentId: null, isRead: false, createdAt: ago(6), updatedAt: ago(6) },
            { notificationId: 64, userId:  7, type: "follow", message: "Gal Meirov started following you.",   sourceUserId: 15, entityId: 15, entityType: "user", commentId: null, isRead: false, createdAt: ago(5), updatedAt: ago(5) },
            { notificationId: 65, userId:  8, type: "follow", message: "Itai Barak started following you.",   sourceUserId: 17, entityId: 17, entityType: "user", commentId: null, isRead: false, createdAt: ago(4), updatedAt: ago(4) },
            { notificationId: 66, userId: 21, type: "follow", message: "Eran Hazan started following you.",   sourceUserId: 19, entityId: 19, entityType: "user", commentId: null, isRead: false, createdAt: ago(3), updatedAt: ago(3) },
            { notificationId: 67, userId: 36, type: "follow", message: "Gal Meirov started following you.",   sourceUserId: 15, entityId: 15, entityType: "user", commentId: null, isRead: false, createdAt: ago(2), updatedAt: ago(2) },

            // ── New mention notifications (68–70) ────────────────────────────────
            { notificationId: 68, userId:  1, type: "mention", message: "Tali Ben-David mentioned you in a comment.", sourceUserId:  8, entityId: 103, entityType: "recipe", commentId: 138, isRead: false, createdAt: ago(3), updatedAt: ago(3) },
            { notificationId: 69, userId:  9, type: "mention", message: "Itai Barak mentioned you in a comment.",    sourceUserId: 17, entityId: 116, entityType: "recipe", commentId: 139, isRead: false, createdAt: ago(2), updatedAt: ago(2) },
            { notificationId: 70, userId:  7, type: "mention", message: "Rivka Stern mentioned you in a comment.",   sourceUserId: 14, entityId: 118, entityType: "recipe", commentId: 140, isRead: false, createdAt: ago(1), updatedAt: ago(1) },

            // ── New comment_reply notifications (71–73) ──────────────────────────
            { notificationId: 71, userId:  4, type: "comment_reply", message: "Maya David replied to your comment.",  sourceUserId:  5, entityId: 103, entityType: "recipe", commentId: 133, isRead: false, createdAt: ago(7), updatedAt: ago(7) },
            { notificationId: 72, userId:  8, type: "comment_reply", message: "Avi Shapiro replied to your comment.", sourceUserId:  7, entityId: 103, entityType: "recipe", commentId: 134, isRead: false, createdAt: ago(6), updatedAt: ago(6) },
            { notificationId: 73, userId:  9, type: "comment_reply", message: "Avi Shapiro replied to your comment.", sourceUserId:  7, entityId: 108, entityType: "recipe", commentId: 135, isRead: true,  createdAt: ago(4), updatedAt: ago(4) }
        ];

        await queryInterface.bulkInsert("Notifications", rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            "Notifications",
            { notificationId: { [Sequelize.Op.in]: SEEDED_IDS } },
            {}
        );
    }
};
