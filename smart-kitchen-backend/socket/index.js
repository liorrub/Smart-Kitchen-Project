"use strict";

const { Server } = require("socket.io");

let io;

function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`[socket] client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[socket] client disconnected: ${socket.id}`);
        });
    });

    console.log("[socket] Socket.IO server initialized");
}

function getIO() {
    if (!io) {
        throw new Error("Socket.IO has not been initialized. Call initSocket first.");
    }
    return io;
}

module.exports = { initSocket, getIO };
