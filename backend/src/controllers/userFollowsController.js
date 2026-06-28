"use strict";

const { successResponse, errorResponse } = require("../utils/responseHelper");
const { getUserById } = require("../../models/usersModel");
const { notify } = require("../services/notificationService");
const {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowerCount,
    getFollowingCount,
    isFollowing,
    getFeedForUser
} = require("../../models/userFollowsModel");

// Roles whose profiles can be followed.
const FOLLOWABLE_ROLES = ["chef", "influencer"];

// Roles that are allowed to follow others.
const ALLOWED_FOLLOWER_ROLES = ["user", "chef", "influencer"];

// POST /api/users/:id/follow
async function follow(req, res, next) {
    try {
        const followerId  = req.authUser.userId;
        const followeeId  = Number(req.params.id);

        // Self-follow check (controller layer in addition to model validation)
        if (followerId === followeeId) {
            return errorResponse(res, 400, "SELF_FOLLOW", "You cannot follow yourself.");
        }

        // Follower role check (admins are excluded per business rules)
        if (!ALLOWED_FOLLOWER_ROLES.includes(req.authUser.userRole)) {
            return errorResponse(res, 403, "FORBIDDEN", "Your account role cannot follow users.");
        }

        // Followee must exist
        const followee = await getUserById(followeeId);
        if (!followee) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
        }

        // Only chefs and influencers are followable
        if (!FOLLOWABLE_ROLES.includes(followee.userRole)) {
            return errorResponse(
                res,
                400,
                "NOT_FOLLOWABLE",
                "You can only follow chefs and Foodies."
            );
        }

        // Duplicate follow check
        const already = await isFollowing(followerId, followeeId);
        if (already) {
            return errorResponse(res, 409, "ALREADY_FOLLOWING", "You are already following this user.");
        }

        await followUser(followerId, followeeId);

        const [followerCount, followingCount] = await Promise.all([
            getFollowerCount(followeeId),
            getFollowingCount(followeeId)
        ]);

        // Notify followee (fire-and-forget; follow action succeeds regardless)
        const follower = req.authUser;
        notify({
            userId: followeeId,
            type: "follow",
            message: `${follower.firstName} ${follower.lastName} started following you.`,
            sourceUserId: followerId,
            entityId: followerId,
            entityType: "user"
        }).catch(err => console.error("[notification] follow trigger failed:", err.message));

        return successResponse(res, 201, {
            followeeId,
            isFollowedByMe: true,
            followerCount,
            followingCount
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/users/:id/follow
async function unfollow(req, res, next) {
    try {
        const followerId = req.authUser.userId;
        const followeeId = Number(req.params.id);

        if (followerId === followeeId) {
            return errorResponse(res, 400, "SELF_UNFOLLOW", "You cannot unfollow yourself.");
        }

        const removed = await unfollowUser(followerId, followeeId);

        if (!removed) {
            return errorResponse(res, 404, "NOT_FOLLOWING", "You are not following this user.");
        }

        const followerCount = await getFollowerCount(followeeId);

        return successResponse(res, 200, {
            followeeId,
            isFollowedByMe: false,
            followerCount
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/users/:id/followers
async function getFollowersList(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const user = await getUserById(userId);
        if (!user) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
        }

        const followers = await getFollowers(userId);

        return successResponse(
            res,
            200,
            followers.map(f => ({
                followId:   f.followId,
                followerId: f.followerId,
                follower:   f.follower,
                createdAt:  f.createdAt
            }))
        );
    } catch (error) {
        next(error);
    }
}

// GET /api/users/:id/following
async function getFollowingList(req, res, next) {
    try {
        const userId = Number(req.params.id);

        const user = await getUserById(userId);
        if (!user) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
        }

        const following = await getFollowing(userId);

        return successResponse(
            res,
            200,
            following.map(f => ({
                followId:   f.followId,
                followeeId: f.followeeId,
                followee:   f.followee,
                createdAt:  f.createdAt
            }))
        );
    } catch (error) {
        next(error);
    }
}

// GET /api/users/:id/profile
// Public profile — accessible to any authenticated viewer.
// Returns safe user fields + followerCount + followingCount + isFollowedByMe.
async function getUserProfile(req, res, next) {
    try {
        const profileUserId = Number(req.params.id);
        const viewerId      = req.authUser.userId;

        const user = await getUserById(profileUserId);
        if (!user) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "User not found.");
        }

        // Never expose password or other sensitive fields
        const { password, ...safeUser } = user;

        const [followerCount, followingCount] = await Promise.all([
            getFollowerCount(profileUserId),
            getFollowingCount(profileUserId)
        ]);

        const isFollowedByMe =
            viewerId !== profileUserId
                ? await isFollowing(viewerId, profileUserId)
                : false;

        return successResponse(res, 200, {
            ...safeUser,
            followerCount,
            followingCount,
            isFollowedByMe
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/feed
// Returns recipes from all users the authenticated caller follows, newest first.
async function getFeed(req, res, next) {
    try {
        const userId = req.authUser.userId;
        const feed   = await getFeedForUser(userId);
        return successResponse(res, 200, feed);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    follow,
    unfollow,
    getFollowersList,
    getFollowingList,
    getFeed
};
