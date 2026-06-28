import "./IngredientPicker.css";
import "./CityPicker.css";

import { useEffect, useMemo, useRef, useState } from "react";

/*
    Searchable city picker with "Other" support.

    Behavior:
    - Empty query → full city list A–Z (with "Other" at end).
    - Typed query → prefix matches first, then substring matches.
    - Selecting "Other" enters custom-city mode: hides the dropdown and
      shows a plain text input. The × button on the "Other" chip returns
      to the city list and clears the value.
    - Fires onChange in the same synthetic-event shape as CustomSelect:
        { target: { name, value } }  where value is the chosen city string or "".
    - Initial value that is not in the cities list is treated as an "Other" city
      (so Settings page pre-fills correctly for users who previously typed a city).
*/
function CityPicker({
    label,
    name,
    value,
    onChange,
    cities = [],
    placeholder = "Search or select city...",
    wrapperClassName = ""
}) {
    const citiesWithoutOther = useMemo(
        () => cities.filter((c) => c !== "Other"),
        [cities]
    );

    const isCustomValue = Boolean(
        value && !citiesWithoutOther.includes(value)
    );

    const [isOtherMode, setIsOtherMode] = useState(isCustomValue);
    const [customCity, setCustomCity] = useState(isCustomValue ? value : "");
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // Close on click outside.
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll highlighted row into view.
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex];
            if (item) item.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    // Empty query → full list. Typed query → prefix matches then substring matches.
    const suggestions = useMemo(() => {
        const trimmed = query.trim();

        if (!trimmed) return cities;

        const lower = trimmed.toLowerCase();

        const prefixMatches = cities.filter((c) =>
            c.toLowerCase().startsWith(lower)
        );
        const substringMatches = cities.filter(
            (c) =>
                !c.toLowerCase().startsWith(lower) &&
                c.toLowerCase().includes(lower)
        );

        return [...prefixMatches, ...substringMatches];
    }, [query, cities]);

    function handleInputChange(event) {
        setQuery(event.target.value);
        setHighlightedIndex(-1);
        setIsOpen(true);
    }

    function handleInputFocus() {
        setIsOpen(true);
    }

    function handleInputClick() {
        setIsOpen(true);
    }

    function handleSelect(city) {
        if (city === "Other") {
            setIsOtherMode(true);
            setCustomCity("");
            setIsOpen(false);
            setQuery("");
            setHighlightedIndex(-1);
            // Emit empty string until user types their custom city.
            onChange({ target: { name, value: "" } });
        } else {
            onChange({ target: { name, value: city } });
            setQuery("");
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    }

    function handleClear() {
        onChange({ target: { name, value: "" } });
        setQuery("");
        setHighlightedIndex(-1);
        inputRef.current?.focus();
    }

    function handleClearOther() {
        setIsOtherMode(false);
        setCustomCity("");
        onChange({ target: { name, value: "" } });
    }

    function handleCustomCityChange(event) {
        const typed = event.target.value;
        setCustomCity(typed);
        onChange({ target: { name, value: typed } });
    }

    function handleKeyDown(event) {
        if (!isOpen) {
            if (event.key === "ArrowDown" || event.key === "Enter") {
                event.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setHighlightedIndex((prev) =>
                    Math.min(prev + 1, suggestions.length - 1)
                );
                break;

            case "ArrowUp":
                event.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                break;

            case "Enter":
                event.preventDefault();
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleSelect(suggestions[highlightedIndex]);
                }
                break;

            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;

            default:
                break;
        }
    }

    const selectedCity =
        !isOtherMode && value && citiesWithoutOther.includes(value)
            ? value
            : null;

    return (
        <div
            className={`ingredient-picker-field city-picker-field ${wrapperClassName}`.trim()}
            ref={containerRef}
        >
            {label && <label>{label}</label>}

            <div className="ingredient-picker-wrapper">
                {isOtherMode ? (
                    <div className="city-picker-other-wrapper">
                        <div className="ingredient-picker-selected">
                            <span className="ingredient-picker-selected-name">
                                Other
                            </span>

                            <button
                                type="button"
                                className="ingredient-picker-clear"
                                onClick={handleClearOther}
                                aria-label="Change city"
                                title="Change city"
                            >
                                ×
                            </button>
                        </div>

                        <div className="city-picker-custom-block">
                            <p className="city-picker-custom-label">
                                Custom city
                            </p>

                            <input
                                type="text"
                                className="ingredient-picker-input"
                                value={customCity}
                                onChange={handleCustomCityChange}
                                placeholder="Enter your city..."
                                autoFocus
                            />
                        </div>
                    </div>
                ) : selectedCity ? (
                    <div className="ingredient-picker-selected">
                        <span className="ingredient-picker-selected-name">
                            {selectedCity}
                        </span>

                        <button
                            type="button"
                            className="ingredient-picker-clear"
                            onClick={handleClear}
                            aria-label="Clear selection"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <input
                        id={`${name}-city-picker`}
                        ref={inputRef}
                        type="text"
                        className={`ingredient-picker-input${isOpen ? " ingredient-picker-input--open" : ""}`}
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onClick={handleInputClick}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        autoComplete="off"
                    />
                )}

                {isOpen && !isOtherMode && !selectedCity && (
                    <div className="ingredient-picker-dropdown" ref={listRef}>
                        {suggestions.length === 0 ? (
                            <div className="ingredient-picker-empty">
                                No cities found
                            </div>
                        ) : (
                            suggestions.map((city, index) => (
                                <button
                                    key={city}
                                    type="button"
                                    className={
                                        index === highlightedIndex
                                            ? "ingredient-picker-option highlighted"
                                            : "ingredient-picker-option"
                                    }
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        handleSelect(city);
                                    }}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                >
                                    {city}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CityPicker;
