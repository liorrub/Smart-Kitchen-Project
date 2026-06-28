"use strict";

// Canonical RecipeComment seed data — 25 rows (IDs 100–124).
// Provides the real comment chains that notifications 35-50 reference.
// Uses IDs 100+ to avoid collisions with runtime comments (IDs 1–99).
//
// Layout:
//   IDs 100–108  Top-level comments (parent recipients for reply notifications)
//   IDs 109–118  Reply comments     (each triggers one comment_reply notification)
//   IDs 119–124  Mention comments   (each triggers one mention notification)
//
// Notification↔comment mapping:
//   notif 35: commentId=109  Daniel(4)  replied to Lior(1)   on recipe 101
//   notif 36: commentId=110  Gal(15)    replied to Daniel(4)  on recipe 101
//   notif 37: commentId=111  Avi(7)     replied to Maya(5)    on recipe 102
//   notif 38: commentId=113  Roi(9)     replied to Lior(1)    on recipe 103
//   notif 39: commentId=112  Daniel(4)  replied to Tali(8)    on recipe 102
//   notif 40: commentId=115  Itai(17)   replied to Avi(7)     on recipe 104
//   notif 41: commentId=116  Maya(5)    replied to Roi(9)     on recipe 105
//   notif 42: commentId=114  Eran(19)   replied to Dana(12)   on recipe 103
//   notif 43: commentId=117  Daniel(4)  replied to Shir(6)    on recipe 106
//   notif 44: commentId=118  Tali(8)    replied to Lior(1)    on recipe 101
//   notif 45: commentId=119  Daniel(4)  mentioned Avi(7)      on recipe 101
//   notif 46: commentId=120  Gal(15)    mentioned Maya(5)     on recipe 102
//   notif 47: commentId=121  Itai(17)   mentioned Dana(12)    on recipe 104
//   notif 48: commentId=122  Roi(9)     mentioned Daniel(4)   on recipe 103
//   notif 49: commentId=123  Eran(19)   mentioned Tali(8)     on recipe 105
//   notif 50: commentId=124  Shir(6)    mentioned Lior(1)     on recipe 106

const CANONICAL_MIN = 100;
const CANONICAL_MAX = 140;
const SEEDED_IDS = Array.from({ length: CANONICAL_MAX - CANONICAL_MIN + 1 }, (_, i) => i + CANONICAL_MIN);

const BASE = new Date("2026-06-10T12:00:00Z");
function daysAgo(d, h = 0) {
    const t = new Date(BASE);
    t.setDate(t.getDate() - d);
    t.setHours(t.getHours() - h);
    return t;
}

module.exports = {
    async up(queryInterface) {
        const rows = [
            // ── Top-level comments (100–108) ─────────────────────────────────────
            { commentId: 100, recipeId: 101, userId:  1, parentCommentId: null, mentionedUserId: null, tags: null, content: "This pasta recipe is so simple yet so satisfying!",              createdAt: daysAgo(12), updatedAt: daysAgo(12) },
            // Restored: were missing because recipe 103 did not exist yet (now fixed)
            { commentId: 104, recipeId: 103, userId:  1, parentCommentId: null, mentionedUserId: null, tags: null, content: "This is a quick, satisfying breakfast I keep coming back to.",   createdAt: daysAgo(14), updatedAt: daysAgo(14) },
            { commentId: 105, recipeId: 103, userId: 12, parentCommentId: null, mentionedUserId: null, tags: null, content: "Quick and nourishing. Perfect for busy mornings.",               createdAt: daysAgo(13), updatedAt: daysAgo(13) },
            { commentId: 101, recipeId: 101, userId:  4, parentCommentId: null, mentionedUserId: null, tags: null, content: "Love how quick this comes together on a weeknight.",             createdAt: daysAgo(11), updatedAt: daysAgo(11) },
            { commentId: 102, recipeId: 102, userId:  5, parentCommentId: null, mentionedUserId: null, tags: null, content: "Perfect for meal prep — I make a batch every Sunday.",           createdAt: daysAgo(11), updatedAt: daysAgo(11) },
            { commentId: 103, recipeId: 102, userId:  8, parentCommentId: null, mentionedUserId: null, tags: null, content: "I added extra tofu and doubled the sauce — incredible.",          createdAt: daysAgo(10), updatedAt: daysAgo(10) },
            { commentId: 106, recipeId: 104, userId:  7, parentCommentId: null, mentionedUserId: null, tags: null, content: "Quick high-protein snack that keeps me full all afternoon.",      createdAt: daysAgo(7),  updatedAt: daysAgo(7)  },
            { commentId: 107, recipeId: 105, userId:  9, parentCommentId: null, mentionedUserId: null, tags: null, content: "Classic Roman carbonara — never use cream, this is the way.",    createdAt: daysAgo(6),  updatedAt: daysAgo(6)  },
            { commentId: 108, recipeId: 106, userId:  6, parentCommentId: null, mentionedUserId: null, tags: null, content: "Pizza perfection. The simplicity is what makes it so good.",     createdAt: daysAgo(4),  updatedAt: daysAgo(4)  },
            // ── Reply comments (109–118) ─────────────────────────────────────────
            { commentId: 109, recipeId: 101, userId:  4, parentCommentId: 100, mentionedUserId: null, tags: null, content: "Agreed — I make this at least twice a week.",                     createdAt: daysAgo(10), updatedAt: daysAgo(10) },
            // Restored: replies to comments 104/105 on recipe 103
            { commentId: 113, recipeId: 103, userId:  9, parentCommentId: 104, mentionedUserId: null, tags: null, content: "Agreed — I add a touch more butter and it comes out perfect.",    createdAt: daysAgo(12), updatedAt: daysAgo(12) },
            { commentId: 114, recipeId: 103, userId: 19, parentCommentId: 105, mentionedUserId: null, tags: null, content: "I do the same every weekday morning. Protein kick!",              createdAt: daysAgo(11), updatedAt: daysAgo(11) },
            { commentId: 110, recipeId: 101, userId: 15, parentCommentId: 101, mentionedUserId: null, tags: null, content: "Same here! 15 minutes start to finish.",                          createdAt: daysAgo(9),  updatedAt: daysAgo(9)  },
            { commentId: 111, recipeId: 102, userId:  7, parentCommentId: 102, mentionedUserId: null, tags: null, content: "Great tip — I keep it in the fridge for 4 days easily.",          createdAt: daysAgo(9),  updatedAt: daysAgo(9)  },
            { commentId: 112, recipeId: 102, userId:  4, parentCommentId: 103, mentionedUserId: null, tags: null, content: "I did the same! Extra sauce is always the right call.",           createdAt: daysAgo(7),  updatedAt: daysAgo(7)  },
            { commentId: 115, recipeId: 104, userId: 17, parentCommentId: 106, mentionedUserId: null, tags: null, content: "High protein and low effort — perfect combo for training days.",  createdAt: daysAgo(5),  updatedAt: daysAgo(5)  },
            { commentId: 116, recipeId: 105, userId:  5, parentCommentId: 107, mentionedUserId: null, tags: null, content: "Perfetto! I added a little black pepper at the end.",             createdAt: daysAgo(4),  updatedAt: daysAgo(4)  },
            { commentId: 117, recipeId: 106, userId:  4, parentCommentId: 108, mentionedUserId: null, tags: null, content: "Couldn't agree more — less really is more with this one.",       createdAt: daysAgo(2),  updatedAt: daysAgo(2)  },
            { commentId: 118, recipeId: 101, userId:  8, parentCommentId: 100, mentionedUserId: null, tags: null, content: "I make this every single week. Never gets old!",                  createdAt: daysAgo(1),  updatedAt: daysAgo(1)  },
            // ── Mention comments (119–124) ───────────────────────────────────────
            { commentId: 119, recipeId: 101, userId:  4, parentCommentId: null, mentionedUserId:  7, tags: null, content: "@Avi you have to try this — it has your name written all over it.",    createdAt: daysAgo(8), updatedAt: daysAgo(8) },
            // Restored: mention of Daniel(4) on recipe 103
            { commentId: 122, recipeId: 103, userId:  9, parentCommentId: null, mentionedUserId:  4, tags: null, content: "@Daniel you have to try this — quick protein hit before training.",    createdAt: daysAgo(9), updatedAt: daysAgo(9) },
            { commentId: 120, recipeId: 102, userId: 15, parentCommentId: null, mentionedUserId:  5, tags: null, content: "@Maya this is exactly the kind of tofu dish you were asking about!",  createdAt: daysAgo(6), updatedAt: daysAgo(6) },
            { commentId: 121, recipeId: 104, userId: 17, parentCommentId: null, mentionedUserId: 12, tags: null, content: "@Dana perfect for your post-workout nutrition plan!",                  createdAt: daysAgo(5), updatedAt: daysAgo(5) },
            { commentId: 123, recipeId: 105, userId: 19, parentCommentId: null, mentionedUserId:  8, tags: null, content: "@Tali this carbonara is totally your kind of comfort food!",           createdAt: daysAgo(2), updatedAt: daysAgo(2) },
            { commentId: 124, recipeId: 106, userId:  6, parentCommentId: null, mentionedUserId:  1, tags: null, content: "@Lior featured this pizza in my latest post — everyone loved it!",    createdAt: daysAgo(1), updatedAt: daysAgo(1) },

            // ── New top-level comments (125–132) ─────────────────────────────────
            { commentId: 125, recipeId: 103, userId:  4, parentCommentId: null, mentionedUserId: null, tags: null, content: "Made this for breakfast — it was light and incredibly tasty.",    createdAt: daysAgo(8), updatedAt: daysAgo(8) },
            { commentId: 126, recipeId: 103, userId:  8, parentCommentId: null, mentionedUserId: null, tags: null, content: "I add spinach and it becomes a whole meal. So versatile.",        createdAt: daysAgo(7), updatedAt: daysAgo(7) },
            { commentId: 127, recipeId: 107, userId:  7, parentCommentId: null, mentionedUserId: null, tags: null, content: "Refrigeration for at least 4 hours is essential — don't skip it.", createdAt: daysAgo(6), updatedAt: daysAgo(6) },
            { commentId: 128, recipeId: 108, userId:  9, parentCommentId: null, mentionedUserId: null, tags: null, content: "The saffron makes all the difference. Technique is spot-on.",     createdAt: daysAgo(5), updatedAt: daysAgo(5) },
            { commentId: 129, recipeId: 113, userId:  4, parentCommentId: null, mentionedUserId: null, tags: null, content: "Family favourite! The honey glaze is absolutely incredible.",     createdAt: daysAgo(5), updatedAt: daysAgo(5) },
            { commentId: 130, recipeId: 116, userId:  5, parentCommentId: null, mentionedUserId: null, tags: null, content: "Added chicken breast and it was perfect. Very authentic Thai.",   createdAt: daysAgo(4), updatedAt: daysAgo(4) },
            { commentId: 131, recipeId: 118, userId: 17, parentCommentId: null, mentionedUserId: null, tags: null, content: "Can't believe how fresh and easy this guacamole is.",            createdAt: daysAgo(3), updatedAt: daysAgo(3) },
            { commentId: 132, recipeId: 122, userId: 14, parentCommentId: null, mentionedUserId: null, tags: null, content: "Best homemade burger I've had. Juicy and perfectly seasoned.",   createdAt: daysAgo(2), updatedAt: daysAgo(2) },

            // ── New reply comments (133–137) ──────────────────────────────────────
            { commentId: 133, recipeId: 103, userId:  5, parentCommentId: 125, mentionedUserId: null, tags: null, content: "Same experience here! The key is not over-mixing the eggs.",     createdAt: daysAgo(7), updatedAt: daysAgo(7) },
            { commentId: 134, recipeId: 103, userId:  7, parentCommentId: 126, mentionedUserId: null, tags: null, content: "Spinach idea is brilliant — adding that tomorrow morning!",       createdAt: daysAgo(6), updatedAt: daysAgo(6) },
            { commentId: 135, recipeId: 108, userId:  7, parentCommentId: 128, mentionedUserId: null, tags: null, content: "Agreed — I source quality saffron for this. Totally worth it.",  createdAt: daysAgo(4), updatedAt: daysAgo(4) },
            { commentId: 136, recipeId: 113, userId:  9, parentCommentId: 129, mentionedUserId: null, tags: null, content: "Try adding grated ginger to the marinade — total game changer!", createdAt: daysAgo(4), updatedAt: daysAgo(4) },
            { commentId: 137, recipeId: 116, userId: 18, parentCommentId: 130, mentionedUserId: null, tags: null, content: "Tofu works perfectly too. I make the vegan version every week.",  createdAt: daysAgo(3), updatedAt: daysAgo(3) },

            // ── New mention comments (138–140) ────────────────────────────────────
            { commentId: 138, recipeId: 103, userId:  8, parentCommentId: null, mentionedUserId:  1, tags: null, content: "@Lior this omelette recipe is your best breakfast dish.",          createdAt: daysAgo(3), updatedAt: daysAgo(3) },
            { commentId: 139, recipeId: 116, userId: 17, parentCommentId: null, mentionedUserId:  9, tags: null, content: "@Roi your green curry is absolutely the best I've ever tasted!",  createdAt: daysAgo(2), updatedAt: daysAgo(2) },
            { commentId: 140, recipeId: 118, userId: 14, parentCommentId: null, mentionedUserId:  7, tags: null, content: "@Avi I made your guacamole at a dinner party — everyone loved it!", createdAt: daysAgo(1), updatedAt: daysAgo(1) }
        ];

        await queryInterface.bulkInsert("RecipeComments", rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            "RecipeComments",
            { commentId: { [Sequelize.Op.in]: SEEDED_IDS } },
            {}
        );
    }
};
