"use strict";

// Canonical CommentLikes seed data — 59 rows.
// Covers top-level comments (100–108) and replies (109–118).
// Rules enforced: no self-likes, no duplicate userId+commentId pairs.
//
// Comment authors (from 20260623000003-seed-recipe-comments.js):
//   100→user1  101→user4  102→user5  103→user8  104→user1  105→user12
//   106→user7  107→user9  108→user6  109→user4  110→user15 111→user7
//   112→user4  113→user9  114→user19 115→user17 116→user5  117→user4
//   118→user8  119→user4  120→user15 121→user17 122→user9  123→user19
//   124→user6

const CANONICAL_LIKES = [
    // Comment 100 (author: 1) — 6 likes
    { userId: 4,  commentId: 100 },
    { userId: 5,  commentId: 100 },
    { userId: 7,  commentId: 100 },
    { userId: 9,  commentId: 100 },
    { userId: 12, commentId: 100 },
    { userId: 15, commentId: 100 },

    // Comment 101 (author: 4) — 4 likes
    { userId: 1,  commentId: 101 },
    { userId: 5,  commentId: 101 },
    { userId: 6,  commentId: 101 },
    { userId: 9,  commentId: 101 },

    // Comment 102 (author: 5) — 5 likes
    { userId: 1,  commentId: 102 },
    { userId: 4,  commentId: 102 },
    { userId: 7,  commentId: 102 },
    { userId: 8,  commentId: 102 },
    { userId: 15, commentId: 102 },

    // Comment 103 (author: 8) — 3 likes
    { userId: 4,  commentId: 103 },
    { userId: 5,  commentId: 103 },
    { userId: 7,  commentId: 103 },

    // Comment 106 (author: 7) — 4 likes
    { userId: 1,  commentId: 106 },
    { userId: 4,  commentId: 106 },
    { userId: 5,  commentId: 106 },
    { userId: 9,  commentId: 106 },

    // Comment 107 (author: 9) — 4 likes
    { userId: 1,  commentId: 107 },
    { userId: 5,  commentId: 107 },
    { userId: 6,  commentId: 107 },
    { userId: 7,  commentId: 107 },

    // Comment 108 (author: 6) — 5 likes
    { userId: 1,  commentId: 108 },
    { userId: 4,  commentId: 108 },
    { userId: 5,  commentId: 108 },
    { userId: 7,  commentId: 108 },
    { userId: 9,  commentId: 108 },

    // Comment 109 — reply (author: 4) — 3 likes
    { userId: 1,  commentId: 109 },
    { userId: 5,  commentId: 109 },
    { userId: 7,  commentId: 109 },

    // Comment 110 — reply (author: 15) — 2 likes
    { userId: 4,  commentId: 110 },
    { userId: 5,  commentId: 110 },

    // Comment 111 — reply (author: 7) — 2 likes
    { userId: 5,  commentId: 111 },
    { userId: 8,  commentId: 111 },

    // Comment 112 — reply (author: 4) — 3 likes
    { userId: 5,  commentId: 112 },
    { userId: 8,  commentId: 112 },
    { userId: 9,  commentId: 112 },

    // Comment 115 — reply (author: 17) — 2 likes
    { userId: 7,  commentId: 115 },
    { userId: 9,  commentId: 115 },

    // Comment 116 — reply (author: 5) — 2 likes
    { userId: 7,  commentId: 116 },
    { userId: 9,  commentId: 116 },

    // Comment 117 — reply (author: 4) — 2 likes
    { userId: 5,  commentId: 117 },
    { userId: 6,  commentId: 117 },

    // Comment 118 — reply (author: 8) — 2 likes
    { userId: 4,  commentId: 118 },
    { userId: 5,  commentId: 118 },

    // ── Restored comment likes (104, 105, 113, 114 — were missing with recipe 103) ──
    // Comment 104 (author: 1)
    { userId: 4, commentId: 104 }, { userId: 5, commentId: 104 }, { userId: 7, commentId: 104 },
    // Comment 105 (author: 12)
    { userId: 4, commentId: 105 }, { userId: 8, commentId: 105 },
    // Comment 113 — reply (author: 9)
    { userId: 1, commentId: 113 }, { userId: 5, commentId: 113 },
    // Comment 114 — reply (author: 19)
    { userId: 5, commentId: 114 },

    // ── New comment likes (125–140) ───────────────────────────────────────────
    // Comment 125 (author: 4) — 4 likes
    { userId: 1, commentId: 125 }, { userId: 5, commentId: 125 }, { userId: 7, commentId: 125 }, { userId: 9, commentId: 125 },
    // Comment 126 (author: 8) — 3 likes
    { userId: 1, commentId: 126 }, { userId: 4, commentId: 126 }, { userId: 5, commentId: 126 },
    // Comment 127 (author: 7) — 3 likes
    { userId: 1, commentId: 127 }, { userId: 5, commentId: 127 }, { userId: 9, commentId: 127 },
    // Comment 128 (author: 9) — 4 likes
    { userId: 1, commentId: 128 }, { userId: 5, commentId: 128 }, { userId: 7, commentId: 128 }, { userId: 12, commentId: 128 },
    // Comment 129 (author: 4) — 3 likes
    { userId: 1, commentId: 129 }, { userId: 5, commentId: 129 }, { userId: 9, commentId: 129 },
    // Comment 130 (author: 5) — 3 likes
    { userId: 4, commentId: 130 }, { userId: 7, commentId: 130 }, { userId: 18, commentId: 130 },
    // Comment 131 (author: 17) — 2 likes
    { userId: 5, commentId: 131 }, { userId: 7, commentId: 131 },
    // Comment 132 (author: 14) — 2 likes
    { userId: 5, commentId: 132 }, { userId: 7, commentId: 132 },
    // Comment 133 — reply (author: 5) — 2 likes
    { userId: 4, commentId: 133 }, { userId: 7, commentId: 133 },
    // Comment 134 — reply (author: 7) — 2 likes
    { userId: 4, commentId: 134 }, { userId: 8, commentId: 134 },
    // Comment 135 — reply (author: 7) — 2 likes
    { userId: 5, commentId: 135 }, { userId: 9, commentId: 135 },
    // Comment 136 — reply (author: 9) — 2 likes
    { userId: 4, commentId: 136 }, { userId: 5, commentId: 136 },
    // Comment 137 — reply (author: 18) — 2 likes
    { userId: 5, commentId: 137 }, { userId: 9, commentId: 137 }
];

module.exports = {
    async up(queryInterface) {
        const now = new Date("2026-06-14T12:00:00Z");
        const rows = CANONICAL_LIKES.map(({ userId, commentId }) => ({
            userId,
            commentId,
            createdAt: now,
            updatedAt: now
        }));
        await queryInterface.bulkInsert("CommentLikes", rows, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete(
            "CommentLikes",
            {
                [Sequelize.Op.or]: CANONICAL_LIKES.map(({ userId, commentId }) => ({
                    userId,
                    commentId
                }))
            },
            {}
        );
    }
};
