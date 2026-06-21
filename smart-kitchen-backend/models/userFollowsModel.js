"use strict";

const { Op } = require("sequelize");
const { UserFollow, User, Recipe, sequelize } = require("./index");

// Subquery reused from recipesModel so the likeCount shape is identical
const LIKE_COUNT_SUBQUERY = sequelize.literal(
    `(SELECT COUNT(*) FROM RecipeLikes AS rl WHERE rl.recipeId = Recipe.recipeId)`
);

// Public attributes returned for a user inside follower/following lists.
// Never exposes email, password, age, or other private fields.
const PUBLIC_USER_ATTRS = ["userId", "firstName", "lastName", "userRole", "city"];

// Create a follow relationship. Caller must validate roles and uniqueness before calling.
async function followUser(followerId, followeeId) {
    const row = await UserFollow.create({ followerId, followeeId });
    return row.toJSON();
}

// Remove a specific follow relationship.
// Returns true if a row was deleted, false if none matched (idempotent for the caller's context).
async function unfollowUser(followerId, followeeId) {
    const count = await UserFollow.destroy({
        where: { followerId, followeeId }
    });
    return count > 0;
}

// List all users who follow the given user (their followers).
async function getFollowers(userId) {
    const rows = await UserFollow.findAll({
        where: { followeeId: userId },
        include: [
            {
                model: User,
                as: "follower",
                attributes: PUBLIC_USER_ATTRS
            }
        ],
        order: [["createdAt", "DESC"]]
    });
    return rows.map(r => r.toJSON());
}

// List all users the given user is following.
async function getFollowing(userId) {
    const rows = await UserFollow.findAll({
        where: { followerId: userId },
        include: [
            {
                model: User,
                as: "followee",
                attributes: PUBLIC_USER_ATTRS
            }
        ],
        order: [["createdAt", "DESC"]]
    });
    return rows.map(r => r.toJSON());
}

// Count how many users follow the given user.
async function getFollowerCount(userId) {
    return UserFollow.count({ where: { followeeId: userId } });
}

// Count how many users the given user is following.
async function getFollowingCount(userId) {
    return UserFollow.count({ where: { followerId: userId } });
}

// Return true if followerId is currently following followeeId.
async function isFollowing(followerId, followeeId) {
    const row = await UserFollow.findOne({
        where: { followerId, followeeId }
    });
    return row !== null;
}

// Return recipes from all users that userId follows, newest first.
// Includes creator public info and like count. No N+1 — single JOIN query.
async function getFeedForUser(userId) {
    const followingRows = await UserFollow.findAll({
        where: { followerId: userId },
        attributes: ["followeeId"]
    });

    if (followingRows.length === 0) return [];

    const followeeIds = followingRows.map(r => r.followeeId);

    const rows = await Recipe.findAll({
        attributes: {
            include: [[LIKE_COUNT_SUBQUERY, "likeCount"]]
        },
        where: { creatorId: { [Op.in]: followeeIds } },
        include: [
            {
                model: User,
                as: "creator",
                attributes: PUBLIC_USER_ATTRS
            }
        ],
        order: [
            ["createdAt", "DESC"],
            ["recipeId", "DESC"]
        ]
    });

    return rows.map(r => {
        const obj = r.toJSON();
        obj.likeCount = Number(obj.likeCount || 0);
        return obj;
    });
}

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    isFollowing,
    getFeedForUser
};
