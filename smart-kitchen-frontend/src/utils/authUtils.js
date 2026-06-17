export function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}
