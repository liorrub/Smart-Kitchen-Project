export const API_BASE_URL = "http://localhost:3000/api";

// Base URL of the backend server (without /api), used to resolve uploaded file paths.
export const BACKEND_BASE_URL = "http://localhost:3000";

// Resolve a stored imageUrl to a full src URL.
// Uploaded files are stored as "/uploads/..." paths and served by the backend.
export function resolveImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("/uploads/")) return `${BACKEND_BASE_URL}${imageUrl}`;
    return imageUrl;
}
