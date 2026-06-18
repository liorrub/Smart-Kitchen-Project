// Read the logged-in user object from localStorage.
export function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

// Read the user's role, checking both "userRole" (current field) and "role" (legacy field).
export function getUserRole(user) {
    return user?.userRole || user?.role;
}

// Build auth headers for a specific user object (used when the caller already has the user).
export function getAuthHeadersForUser(user) {
    return {
        "x-user-id": user?.userId,
        "x-user-role": getUserRole(user)
    };
}

// Build auth headers by reading the current user from localStorage.
export function getAuthHeaders() {
    return getAuthHeadersForUser(getStoredUser());
}
