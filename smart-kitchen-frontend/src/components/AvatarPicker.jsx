import "./AvatarPicker.css";

import AvatarImage from "./AvatarImage";
import { AVATAR_CATALOG, AVATAR_DEFAULT } from "../utils/avatarCatalog";

// Visual grid of preset avatar options.
// No visible labels or family headings — the user picks by appearance.
// Props:
//   value        — currently selected avatarKey
//   onChange(key) — called when the user picks a new avatar
function AvatarPicker({ value, onChange }) {
    const selected = value || AVATAR_DEFAULT;

    return (
        <div className="avatar-picker">
            <p className="avatar-picker-label">Choose your avatar</p>
            <div className="avatar-picker-grid">
                {AVATAR_CATALOG.map(avatar => (
                    <button
                        key={avatar.key}
                        type="button"
                        aria-label={avatar.label}
                        aria-pressed={selected === avatar.key}
                        className={`avatar-picker-option${selected === avatar.key ? " selected" : ""}`}
                        onClick={() => onChange(avatar.key)}
                    >
                        <AvatarImage
                            avatarKey={avatar.key}
                            firstName=""
                            size="lg"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default AvatarPicker;
