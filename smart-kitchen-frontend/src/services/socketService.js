// Socket.IO client singleton
// One connection is shared across the whole app.
// Call connectSocket(userId) on mount and disconnectSocket() on unmount.

import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000";

let socket = null;

// Connect to the server with the current user's ID in the auth handshake.
// Returns the existing socket if already connected.
export function connectSocket(userId) {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { userId }
    });

    return socket;
}

// Return the current socket instance (may be null if not connected).
export function getSocket() {
    return socket;
}

// Disconnect and clear the singleton so the next connectSocket creates a fresh connection.
export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
