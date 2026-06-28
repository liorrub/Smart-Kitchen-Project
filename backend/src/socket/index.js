"use strict";

const { Server } = require("socket.io");
const { getUserById } = require("../../models/usersModel");
const { registerRecipeDiscussion } = require("./recipeDiscussion");
const { registerNotifications } = require("./notifications");

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    // Auth middleware — runs during the handshake, BEFORE the client receives the
    // CONNECT packet and BEFORE any connection handlers register their listeners.
    // This guarantees socket.authUser is available synchronously in all handlers.
    io.use(async (socket, next) => {
        const userId = Number(socket.handshake.auth.userId);
        if (!userId || !Number.isFinite(userId)) {
            return next(new Error("Authentication failed: missing userId"));
        }
        try {
            const user = await getUserById(userId);
            if (!user) return next(new Error("Authentication failed: user not found"));
            socket.authUser = user;
            next();
        } catch (err) {
            console.error("[socket] auth middleware error:", err.message);
            next(new Error("Authentication failed: server error"));
        }
    });

    // General connection logging (socket.authUser already set by middleware)
    io.on("connection", (socket) => {
        console.log(`[socket] client connected: userId=${socket.authUser.userId} (${socket.id})`);
        socket.on("disconnect", () => {
            console.log(`[socket] client disconnected: userId=${socket.authUser.userId} (${socket.id})`);
        });
    });

    // Register recipe discussion events
    registerRecipeDiscussion(io);

    // Register personal notification rooms
    registerNotifications(io);

    console.log("[socket] Socket.IO server initialized");
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Call initSocket first.");
    }
    return io;
}

module.exports = { initSocket, getIO };
