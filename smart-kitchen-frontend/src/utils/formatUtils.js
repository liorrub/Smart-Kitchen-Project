// Convert snake_case or kebab-case values to Title Case. Returns "Unknown" for empty values.
export function formatText(value) {
    if (!value) return "Unknown";

    return String(value)
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
