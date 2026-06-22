"use strict";

const { Op } = require("sequelize");
const { User, Recipe, Review, UserFollow, sequelize } = require("./index");

// Public profile aggregation — returns all stats needed for a user's profile page.
// Pass viewerId (the logged-in user's ID) to compute isFollowedByMe; omit for unauthenticated callers.
// No sensitive fields (email, password) are included.
async function getUserPublicProfile(userId, viewerId) {
    const user = await User.findByPk(userId, {
        attributes: [
            "userId", "firstName", "lastName",
            "city", "cookingLevel", "userRole",
            "username", "avatarKey"
        ]
    });

    if (!user) return null;

    const plain = user.get({ plain: true });

    const [
        recipeCount,
        reviewCount,
        helpfulVotesTotal,
        avgRatingRows,
        recentRecipes,
        followerCount,
        followingCount
    ] = await Promise.all([
        Recipe.count({ where: { creatorId: userId } }),
        Review.count({ where: { userId } }),
        Review.sum("helpfulVotes", { where: { userId } }),
        // Avg rating of reviews written about recipes created by this user
        sequelize.query(
            `SELECT AVG(r.rating) AS avgRating, COUNT(r.reviewId) AS totalRatings
             FROM Reviews r
             INNER JOIN Recipes rec ON r.recipeId = rec.recipeId
             WHERE rec.creatorId = :userId`,
            { replacements: { userId }, type: sequelize.QueryTypes.SELECT }
        ),
        Recipe.findAll({
            where: { creatorId: userId },
            attributes: [
                "recipeId", "title", "category", "cuisine",
                "difficulty", "totalTime", "servings", "tags"
            ],
            order: [["recipeId", "DESC"]],
            limit: 4
        }),
        UserFollow.count({ where: { followeeId: userId } }),
        UserFollow.count({ where: { followerId: userId } })
    ]);

    const avgRow = avgRatingRows[0] || {};

    const isFollowedByMe =
        viewerId && viewerId !== userId
            ? (await UserFollow.findOne({ where: { followerId: viewerId, followeeId: userId } })) !== null
            : false;

    return {
        ...plain,
        recipeCount,
        reviewCount,
        totalHelpfulVotes: Number(helpfulVotesTotal || 0),
        avgRating: avgRow.avgRating != null
            ? Number(Number(avgRow.avgRating).toFixed(1))
            : null,
        totalRatings: Number(avgRow.totalRatings || 0),
        followerCount,
        followingCount,
        isFollowedByMe,
        recentRecipes: recentRecipes.map(r => r.toJSON())
    };
}

// Search users by username or name — prefix match only, no city search.
// Priority order: exact username > username prefix > first name prefix > last name prefix.
async function searchPublicUsers(query, role) {
    const where = {};

    if (role && role !== "all") {
        where.userRole = role;
    }

    if (query) {
        const prefix = `${query}%`;
        const lowerPrefix = `${query.toLowerCase()}%`;
        where[Op.or] = [
            { username: { [Op.like]: lowerPrefix } },
            { firstName: { [Op.like]: prefix } },
            { lastName: { [Op.like]: prefix } }
        ];
    }

    const users = await User.findAll({
        where,
        attributes: [
            "userId", "firstName", "lastName",
            "city", "cookingLevel", "userRole",
            "username", "avatarKey",
            [
                sequelize.literal(
                    "(SELECT COUNT(*) FROM Recipes AS r WHERE r.creatorId = User.userId)"
                ),
                "recipeCount"
            ],
            [
                sequelize.literal(
                    "(SELECT COUNT(*) FROM UserFollows AS uf WHERE uf.followeeId = User.userId)"
                ),
                "followerCount"
            ]
        ],
        order: query
            ? [
                [
                    sequelize.literal(
                        `CASE
                            WHEN LOWER(username) = ${sequelize.escape(query.toLowerCase())} THEN 0
                            WHEN username LIKE ${sequelize.escape(query + "%")} THEN 1
                            WHEN firstName LIKE ${sequelize.escape(query + "%")} THEN 2
                            WHEN lastName LIKE ${sequelize.escape(query + "%")} THEN 3
                            ELSE 4
                        END`
                    ),
                    "ASC"
                ],
                ["userId", "ASC"]
            ]
            : [["userId", "ASC"]],
        limit: 50
    });

    return users.map(u => {
        const obj = u.toJSON();
        obj.recipeCount = Number(obj.recipeCount || 0);
        obj.followerCount = Number(obj.followerCount || 0);
        return obj;
    });
}

// Returns all chefs and influencers with aggregated stats for the Discover page.
async function getDiscoverUsers() {
    const users = await User.findAll({
        where: { userRole: ["chef", "influencer"] },
        attributes: [
            "userId", "firstName", "lastName",
            "city", "cookingLevel", "userRole",
            "username", "avatarKey",
            [
                sequelize.literal(
                    "(SELECT COUNT(*) FROM Recipes AS r WHERE r.creatorId = User.userId)"
                ),
                "recipeCount"
            ],
            [
                sequelize.literal(
                    "(SELECT AVG(rev.rating) FROM Reviews rev" +
                    " INNER JOIN Recipes rec ON rev.recipeId = rec.recipeId" +
                    " WHERE rec.creatorId = User.userId)"
                ),
                "avgRating"
            ],
            [
                sequelize.literal(
                    "(SELECT COUNT(*) FROM Reviews AS rev WHERE rev.userId = User.userId)"
                ),
                "reviewCount"
            ],
            [
                sequelize.literal(
                    "(SELECT COUNT(*) FROM UserFollows AS uf WHERE uf.followeeId = User.userId)"
                ),
                "followerCount"
            ]
        ],
        order: [
            [sequelize.literal("recipeCount"), "DESC"],
            ["userId", "ASC"]
        ]
    });

    return users.map(u => {
        const obj = u.toJSON();
        obj.recipeCount = Number(obj.recipeCount || 0);
        obj.avgRating = obj.avgRating != null
            ? Number(Number(obj.avgRating).toFixed(1))
            : null;
        obj.reviewCount = Number(obj.reviewCount || 0);
        obj.followerCount = Number(obj.followerCount || 0);
        return obj;
    });
}

module.exports = { getUserPublicProfile, searchPublicUsers, getDiscoverUsers };
