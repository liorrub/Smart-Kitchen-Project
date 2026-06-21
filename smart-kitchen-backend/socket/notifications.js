"use strict";

// Socket.IO personal notification rooms.
// Each authenticated user automatically joins user:<userId> on connection.
// emitNotificationToUser broadcasts to all sockets in that room (multi-tab safe).

const { getUserById } = require("../models/usersModel");

// Stored when registerNotifications(io) is called from socket/index.js
let _io = null;

function registerNotifications(io) {
    _io = io;

    io.on("connection", async (socket) => {
        const userId = Number(socket.handshake.auth.userId);

        // Guard: invalid userId — recipeDiscussion.js will disconnect this socket
        if (!userId || !Number.isFinite(userId)) return;

        let user;
        try {
            user = await getUserById(userId);
        } catch (err) {
            console.error("[socket:notifications] user lookup failed:", err.message);
            return;
        }

        if (!user) return;

        // Join the personal notification room
        socket.join(`user:${userId}`);
        console.log(`[socket:notifications] userId=${userId} joined user:${userId} (socket=${socket.id})`);
    });
}

// Emit a newNotification event to every connected socket belonging to userId.
function emitNotificationToUser(userId, notification) {
    if (!_io) throw new Error("Socket.IO has not been initialized. Call initSocket first.");
    _io.to(`user:${userId}`).emit("newNotification", notification);
}

module.exports = { registerNotifications, emitNotificationToUser };
