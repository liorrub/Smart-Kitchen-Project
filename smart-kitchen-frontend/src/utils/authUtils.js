export function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

export function getUserRole(user) {
    return user?.userRole || user?.role;
}

export function getAuthHeadersForUser(user) {
    return {
        "x-user-id": user?.userId,
        "x-user-role": getUserRole(user)
    };
}

export function getAuthHeaders() {
    return getAuthHeadersForUser(getStoredUser());
}
