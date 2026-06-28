export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

// Base URL of the backend server (without /api), used to resolve uploaded file paths.
export const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";

// Resolve a stored imageUrl to a full src URL.
// Uploaded files are stored as "/uploads/..." paths and served by the backend.
export function resolveImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("/uploads/")) return `${BACKEND_BASE_URL}${imageUrl}`;
    return imageUrl;
}
