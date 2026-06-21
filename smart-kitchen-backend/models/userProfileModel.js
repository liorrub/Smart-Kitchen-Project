"use strict";

const { Op } = require("sequelize");
const { User, Recipe, Review, sequelize } = require("./index");

// Public profile aggregation — returns all stats needed for a user's profile page.
// No sensitive fields (email, password) are included.
async function getUserPublicProfile(userId) {
    const user = await User.findByPk(userId, {
        attributes: [
            "userId", "firstName", "lastName",
            "city", "cookingLevel", "userRole"
        ]
    });

    if (!user) return null;

    const plain = user.get({ plain: true });

    const [
        recipeCount,
        reviewCount,
        helpfulVotesTotal,
        avgRatingRows,
        recentRecipes
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
        })
    ]);

    const avgRow = avgRatingRows[0] || {};

    return {
        ...plain,
        recipeCount,
        reviewCount,
        totalHelpfulVotes: Number(helpfulVotesTotal || 0),
        avgRating: avgRow.avgRating != null
            ? Number(Number(avgRow.avgRating).toFixed(1))
            : null,
        totalRatings: Number(avgRow.totalRatings || 0),
        followerCount: 0,
        recentRecipes: recentRecipes.map(r => r.toJSON())
    };
}

// Search users by name, city, or role — returns only public fields.
async function searchPublicUsers(query, role) {
    const where = {};

    if (role && role !== "all") {
        where.userRole = role;
    }

    if (query) {
        const pattern = `%${query}%`;
        where[Op.or] = [
            { firstName: { [Op.like]: pattern } },
            { lastName: { [Op.like]: pattern } },
            { city: { [Op.like]: pattern } }
        ];
    }

    const users = await User.findAll({
        where,
        attributes: [
            "userId", "firstName", "lastName",
            "city", "cookingLevel", "userRole",
            [
                sequelize.literal(
                    "(SELECT COUNT(*) FROM Recipes AS r WHERE r.creatorId = User.userId)"
                ),
                "recipeCount"
            ]
        ],
        order: [["userId", "ASC"]],
        limit: 50
    });

    return users.map(u => {
        const obj = u.toJSON();
        obj.recipeCount = Number(obj.recipeCount || 0);
        obj.followerCount = 0;
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
        obj.followerCount = 0;
        return obj;
    });
}

module.exports = { getUserPublicProfile, searchPublicUsers, getDiscoverUsers };
