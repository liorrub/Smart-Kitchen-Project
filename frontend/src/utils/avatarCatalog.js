// Mirrors the backend catalog at backend/data/avatarCatalog.js.
// Each key maps to src/assets/avatars/<key>.png.
// Provides display metadata used in AvatarPicker (aria-labels only — not shown visually).

export const AVATAR_DEFAULT = "masculine";

export const AVATAR_CATALOG = [
    { key: "masculine",         label: "Masculine",         family: "General" },
    { key: "feminine",          label: "Feminine",          family: "General" },
    { key: "chef_masculine",    label: "Chef (M)",          family: "Chef" },
    { key: "chef_feminine",     label: "Chef (F)",          family: "Chef" },
    { key: "foodie_masculine",  label: "Foodie (M)",        family: "Foodie" },
    { key: "foodie_feminine",   label: "Foodie (F)",        family: "Foodie" },
    { key: "baker_masculine",   label: "Baker (M)",         family: "Baker" },
    { key: "baker_feminine",    label: "Baker (F)",         family: "Baker" },
    { key: "healthy_masculine", label: "Healthy Eater (M)", family: "Healthy" },
    { key: "healthy_feminine",  label: "Healthy Eater (F)", family: "Healthy" }
];

const KEY_SET = new Set(AVATAR_CATALOG.map(a => a.key));

export function isValidAvatarKey(key) {
    return typeof key === "string" && KEY_SET.has(key);
}

// Returns the key if valid, otherwise returns the default.
export function resolveAvatarKey(key) {
    return isValidAvatarKey(key) ? key : AVATAR_DEFAULT;
}
