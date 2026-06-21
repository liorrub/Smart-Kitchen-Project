import "./IngredientPicker.css";

import { useEffect, useMemo, useRef, useState } from "react";

/*
    Searchable single-select picker for ingredients.

    Behavior:
    - Clicking or focusing the field opens the dropdown even when the query is empty.
    - Empty query → full ingredient list sorted A–Z.
    - Typed query → prefix matches first (A–Z), then substring matches (A–Z).
    - Keyboard: ArrowDown / ArrowUp / Enter / Escape.
    - Click outside closes the dropdown.
    - Selecting an item fires onChange in the same synthetic-event shape as CustomSelect:
        { target: { name, value } }  where value is String(ingredientId) or "".
*/
function IngredientPicker({
    label,
    name,
    value,
    onChange,
    ingredients = [],
    placeholder = "Search ingredient...",
    wrapperClassName = ""
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    // When a value is imposed externally (e.g. handleProductReady),
    // collapse the dropdown and clear any in-progress query.
    useEffect(() => {
        if (value) {
            setQuery("");
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    }, [value]);

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

    // Scroll the highlighted row into view.
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex];
            if (item) item.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    const selectedIngredient = useMemo(() => {
        if (!value) return null;
        return (
            ingredients.find(
                (ingredient) =>
                    String(ingredient.ingredientId) === String(value)
            ) || null
        );
    }, [value, ingredients]);

    // Empty query → full A–Z list.
    // Typed query → prefix matches (A–Z) before substring matches (A–Z), all case-insensitive.
    const suggestions = useMemo(() => {
        const trimmed = query.trim();

        if (!trimmed) {
            return [...ingredients].sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
            );
        }

        const lower = trimmed.toLowerCase();

        const prefixMatches = ingredients
            .filter((i) => i.name.toLowerCase().startsWith(lower))
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
            );

        const substringMatches = ingredients
            .filter(
                (i) =>
                    !i.name.toLowerCase().startsWith(lower) &&
                    i.name.toLowerCase().includes(lower)
            )
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
            );

        return [...prefixMatches, ...substringMatches];
    }, [query, ingredients]);

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

    function handleSelect(ingredient) {
        onChange({
            target: {
                name,
                value: String(ingredient.ingredientId)
            }
        });
        setQuery("");
        setIsOpen(false);
        setHighlightedIndex(-1);
    }

    function handleClear() {
        onChange({ target: { name, value: "" } });
        setQuery("");
        setHighlightedIndex(-1);
        // Focus input — onFocus will open the dropdown.
        inputRef.current?.focus();
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
                if (
                    highlightedIndex >= 0 &&
                    suggestions[highlightedIndex]
                ) {
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

    return (
        <div
            className={`ingredient-picker-field ${wrapperClassName}`.trim()}
            ref={containerRef}
        >
            {label && (
                <label htmlFor={`${name}-ingredient-picker`}>
                    {label}
                </label>
            )}

            <div className="ingredient-picker-wrapper">
                {selectedIngredient ? (
                    <div className="ingredient-picker-selected">
                        <span className="ingredient-picker-selected-name">
                            {selectedIngredient.name}
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
                        id={`${name}-ingredient-picker`}
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

                {isOpen && (
                    <div className="ingredient-picker-dropdown" ref={listRef}>
                        {suggestions.length === 0 ? (
                            <div className="ingredient-picker-empty">
                                No products found
                            </div>
                        ) : (
                            suggestions.map((ingredient, index) => (
                                <button
                                    key={ingredient.ingredientId}
                                    type="button"
                                    className={
                                        index === highlightedIndex
                                            ? "ingredient-picker-option highlighted"
                                            : "ingredient-picker-option"
                                    }
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        handleSelect(ingredient);
                                    }}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                >
                                    {ingredient.name}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default IngredientPicker;
