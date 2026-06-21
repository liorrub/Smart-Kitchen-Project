import "./AvatarImage.css";

import { useState } from "react";
import { resolveAvatarKey } from "../utils/avatarCatalog";

function getAvatarSrc(key) {
    try {
        return require(`../assets/avatars/${key}.png`);
    } catch {
        return null;
    }
}

// Renders a circular avatar image from the approved PNG catalog.
// Falls back to masculine.png for invalid or missing keys.
// Falls back to an initials circle only if masculine.png itself cannot load.
// Props:
//   avatarKey  — catalog key (e.g. "chef_masculine")
//   firstName  — used for alt text and last-resort initials fallback
//   size       — "xs" | "sm" | "md" | "lg" | "xl"  (default "md")
//   className  — extra CSS classes
function AvatarImage({ avatarKey, firstName, lastName, size = "md", className = "" }) {
    const [useFallback, setUseFallback] = useState(false);

    const resolvedKey = resolveAvatarKey(avatarKey);
    const key = useFallback ? "masculine" : resolvedKey;
    const src = getAvatarSrc(key);
    const sizeClass = `avatar-${size}`;
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || "User";

    if (!src) {
        // require() threw — show initials as last resort
        return (
            <div
                className={`avatar-initials ${sizeClass} ${className}`}
                aria-label={`${displayName} avatar`}
                title={displayName}
            >
                {(firstName || "?")[0].toUpperCase()}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={`${displayName} avatar`}
            title={displayName}
            className={`avatar-img ${sizeClass} ${className}`}
            onError={() => {
                if (!useFallback) setUseFallback(true);
            }}
        />
    );
}

export default AvatarImage;
