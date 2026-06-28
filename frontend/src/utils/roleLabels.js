export const ROLE_LABELS = {
    user: "Home Cook",
    chef: "Chef",
    influencer: "Foodie",
    admin: "Admin"
};

export function getRoleLabel(role) {
    return ROLE_LABELS[role] || role;
}
