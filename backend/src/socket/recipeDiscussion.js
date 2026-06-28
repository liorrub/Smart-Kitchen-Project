"use strict";

// Recipe discussion socket handlers
// Manages real-time events for the recipe discussion page:
// joining/leaving rooms, sending comments, and typing indicators.

const { getUserById } = require("../../models/usersModel");
const { RecipeComment, Recipe, User } = require("../../models");
const { notify } = require("../services/notificationService");

// Count unique users in a room by collecting distinct userIds across all sockets.
// A user with multiple tabs open is counted only once.
function getRoomUniqueUserCount(io, room) {
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) return 0;

    const userIds = new Set();
    for (const socketId of roomSockets) {
        const s = io.sockets.sockets.get(socketId);
        if (s?.authUser?.userId) userIds.add(s.authUser.userId);
    }
    return userIds.size;
}

// Registers all recipe discussion events on the Socket.IO server.
// Each connection is validated against the userId sent in the handshake auth object.
function registerRecipeDiscussion(io) {
    io.on("connection", async (socket) => {
        // Validate the connecting user before allowing any events
        const userId = Number(socket.handshake.auth.userId);

        if (!userId) {
            socket.disconnect(true);
            return;
        }

        let authUser;
        try {
            authUser = await getUserById(userId);
        } catch (err) {
            console.error("[socket] auth lookup failed:", err.message);
            socket.disconnect(true);
            return;
        }

        if (!authUser) {
            socket.disconnect(true);
            return;
        }

        socket.authUser = authUser;
        console.log(`[socket] user authenticated: userId=${userId}, socket=${socket.id}`);

        // Join the recipe room and broadcast the updated viewer count
        socket.on("joinRecipeRoom", ({ recipeId }) => {
            const room = `recipe-${recipeId}`;
            socket.join(room);
            const count = getRoomUniqueUserCount(io, room);
            io.to(room).emit("roomUserCount", { count });
            console.log(`[socket] joinRecipeRoom: userId=${userId} joined recipe-${recipeId} (${count} unique viewers)`);
        });

        // Leave the recipe room and broadcast the updated viewer count
        socket.on("leaveRecipeRoom", ({ recipeId }) => {
            const room = `recipe-${recipeId}`;
            socket.leave(room);
            const count = getRoomUniqueUserCount(io, room);
            io.to(room).emit("roomUserCount", { count });
            console.log(`[socket] leaveRecipeRoom: userId=${userId} left recipe-${recipeId} (${count} unique viewers)`);
        });

        // Save a new comment to the DB and broadcast it to everyone in the room
        socket.on("sendRecipeComment", async ({ recipeId, content, tags, parentCommentId, mentionedUserId }) => {
            try {
                const comment = await RecipeComment.create({
                    recipeId,
                    userId: socket.authUser.userId,
                    content,
                    tags: tags ?? null,
                    parentCommentId: parentCommentId ?? null,
                    mentionedUserId: mentionedUserId ?? null
                });

                // Re-fetch with author and mentionedUser so the client gets full names + avatarKey
                const fullComment = await RecipeComment.findByPk(comment.commentId, {
                    include: [
                        {
                            model: User,
                            as: "author",
                            attributes: ["userId", "firstName", "lastName", "avatarKey"]
                        },
                        {
                            model: User,
                            as: "mentionedUser",
                            attributes: ["userId", "firstName", "lastName"]
                        }
                    ]
                });

                const room = `recipe-${recipeId}`;
                // New comments have no likes yet; include fields so CommentItem renders consistently
                io.to(room).emit("newRecipeComment", {
                    ...fullComment.toJSON(),
                    likeCount: 0,
                    isLikedByMe: false
                });
                console.log(`[socket] sendRecipeComment: userId=${userId} posted commentId=${comment.commentId} in recipe-${recipeId}`);

                // Fire notification triggers after broadcast; tracked to avoid duplicates
                const authorName = `${socket.authUser.firstName} ${socket.authUser.lastName}`;
                const notifiedUserIds = new Set();

                // Top-level comment only: notify the recipe creator
                if (!parentCommentId) {
                    try {
                        const recipe = await Recipe.findByPk(recipeId, { attributes: ["creatorId"] });
                        if (recipe && recipe.creatorId !== socket.authUser.userId) {
                            await notify({
                                userId: recipe.creatorId,
                                type: "recipe_comment",
                                message: `${authorName} commented on your recipe.`,
                                sourceUserId: socket.authUser.userId,
                                entityId: recipeId,
                                entityType: "recipe",
                                commentId: comment.commentId
                            });
                            notifiedUserIds.add(recipe.creatorId);
                        }
                    } catch (err) {
                        console.error("[notification] recipe_comment trigger failed:", err.message);
                    }
                }

                if (parentCommentId) {
                    try {
                        const parent = await RecipeComment.findByPk(parentCommentId, {
                            attributes: ["userId"]
                        });
                        if (parent && parent.userId !== socket.authUser.userId) {
                            await notify({
                                userId: parent.userId,
                                type: "comment_reply",
                                message: `${authorName} replied to your comment.`,
                                sourceUserId: socket.authUser.userId,
                                entityId: recipeId,
                                entityType: "recipe",
                                commentId: comment.commentId
                            });
                            notifiedUserIds.add(parent.userId);
                        }
                    } catch (err) {
                        console.error("[notification] comment_reply trigger failed:", err.message);
                    }
                }

                if (mentionedUserId && mentionedUserId !== socket.authUser.userId && !notifiedUserIds.has(mentionedUserId)) {
                    try {
                        await notify({
                            userId: mentionedUserId,
                            type: "mention",
                            message: `${authorName} mentioned you in a comment.`,
                            sourceUserId: socket.authUser.userId,
                            entityId: recipeId,
                            entityType: "recipe",
                            commentId: comment.commentId
                        });
                    } catch (err) {
                        console.error("[notification] mention trigger failed:", err.message);
                    }
                }
            } catch (err) {
                console.error("[socket] sendRecipeComment error:", err.message);
            }
        });

        // Update a comment's content and broadcast the change to the whole room.
        // Only the comment author or an admin is allowed to edit.
        socket.on("editRecipeComment", async ({ recipeId, commentId, content }) => {
            try {
                if (!content || !String(content).trim()) return;

                const comment = await RecipeComment.findOne({
                    where: { commentId, recipeId }
                });

                if (!comment) return;

                const isOwner = socket.authUser.userId === comment.userId;
                const isAdmin = socket.authUser.userRole === "admin";

                if (!isOwner && !isAdmin) {
                    socket.emit("commentError", { message: "You do not have permission to edit this comment." });
                    return;
                }

                await comment.update({ content: String(content).trim() });

                io.to(`recipe-${recipeId}`).emit("recipeCommentEdited", {
                    commentId: comment.commentId,
                    content: comment.content,
                    updatedAt: comment.updatedAt
                });
                console.log(`[socket] editRecipeComment: userId=${userId} edited commentId=${commentId} in recipe-${recipeId}`);
            } catch (err) {
                console.error("[socket] editRecipeComment error:", err.message);
            }
        });

        // Delete a comment (and cascade its replies via DB constraint) and notify the room.
        // Only the comment author or an admin is allowed to delete.
        socket.on("deleteRecipeComment", async ({ recipeId, commentId }) => {
            try {
                const comment = await RecipeComment.findOne({
                    where: { commentId, recipeId }
                });

                if (!comment) return;

                const isOwner = socket.authUser.userId === comment.userId;
                const isAdmin = socket.authUser.userRole === "admin";

                if (!isOwner && !isAdmin) {
                    socket.emit("commentError", { message: "You do not have permission to delete this comment." });
                    return;
                }

                await comment.destroy();

                io.to(`recipe-${recipeId}`).emit("recipeCommentDeleted", { commentId });
                console.log(`[socket] deleteRecipeComment: userId=${userId} deleted commentId=${commentId} in recipe-${recipeId}`);
            } catch (err) {
                console.error("[socket] deleteRecipeComment error:", err.message);
            }
        });

        // Forward typing indicator to everyone else in the room (not the sender)
        socket.on("typingRecipeComment", ({ recipeId }) => {
            const room = `recipe-${recipeId}`;
            socket.to(room).emit("userTyping", {
                userId: socket.authUser.userId,
                userName: `${socket.authUser.firstName} ${socket.authUser.lastName}`
            });
        });

        // Forward stop-typing indicator to everyone else in the room
        socket.on("stopTypingRecipeComment", ({ recipeId }) => {
            const room = `recipe-${recipeId}`;
            socket.to(room).emit("userStoppedTyping", { userId: socket.authUser.userId });
        });

        // On disconnect, clear the typing indicator in every room this socket was in
        socket.on("disconnect", () => {
            console.log(`[socket] discussion disconnect: userId=${userId} (socket=${socket.id})`);
            for (const room of socket.rooms) {
                // socket.rooms always includes the socket's own id — skip it
                if (room !== socket.id) {
                    socket.to(room).emit("userStoppedTyping", { userId: socket.authUser.userId });
                }
            }
        });
    });
}

module.exports = { registerRecipeDiscussion };
