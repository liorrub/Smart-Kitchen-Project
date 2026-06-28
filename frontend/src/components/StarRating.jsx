import "./StarRating.css";

import { useState } from "react";

function StarRating({ value = 0, onChange, readOnly = false, size = "md" }) {
    const [hovered, setHovered] = useState(0);

    const display = hovered || value;

    return (
        <div
            className={`star-rating star-rating--${size}${readOnly ? " star-rating--readonly" : ""}`}
            role={readOnly ? undefined : "group"}
            aria-label={readOnly ? undefined : "Star rating"}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`star-rating-star${display >= star ? " star-rating-star--filled" : ""}`}
                    onClick={readOnly ? undefined : () => onChange(star)}
                    onMouseEnter={readOnly ? undefined : () => setHovered(star)}
                    onMouseLeave={readOnly ? undefined : () => setHovered(0)}
                    aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                    disabled={readOnly}
                    tabIndex={readOnly ? -1 : 0}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

export default StarRating;
