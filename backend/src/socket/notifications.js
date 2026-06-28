"use strict";

// Socket.IO personal notification rooms.
// Each authenticated user automatically joins user:<userId> on connection.
// emitNotificationToUser broadcasts to all sockets in that room (multi-tab safe).

// Stored when registerNotifications(io) is called from socket/index.js
let _io = null;

function registerNotifications(io) {
    _io = io;

    // socket.authUser is set by io.use() middleware in socket/index.js — no async needed here.
    io.on("connection", (socket) => {
        const userId = socket.authUser.userId;

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
