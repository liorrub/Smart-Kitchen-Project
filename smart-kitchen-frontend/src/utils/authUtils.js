export function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

export function getAuthHeaders() {
    const storedUser = getStoredUser();

    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole || storedUser?.role
    };
}
