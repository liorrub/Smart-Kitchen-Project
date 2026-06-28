import "./MultiIngredientPicker.css";

import { useEffect, useMemo, useRef, useState } from "react";

/*
    Searchable multi-select ingredient picker.

    Behavior:
    - Clicking or focusing the field opens the dropdown (even when empty).
    - Empty query → full ingredient list sorted A–Z.
    - Typed query → prefix matches (A–Z) before substring matches (A–Z).
    - Selecting an ingredient keeps the dropdown open and clears the query.
    - Selected items show ✓ in the dropdown; clicking them again removes them.
    - Chips appear below the input (outside the dropdown) whenever any are selected.
    - Each chip has × to deselect; a "Clear all" button removes everything at once.
    - Keyboard: ArrowDown / ArrowUp / Enter toggles; Escape closes.
    - Click outside closes the dropdown.

    Props:
        ingredients   — full ingredient catalog: [{ ingredientId, name, ... }]
        selectedIds   — array of currently-selected ingredientId numbers
        onToggle(ingredient) — called with the ingredient object to add/remove
        onClearAll()  — removes all selections
        placeholder   — input placeholder text
*/
function MultiIngredientPicker({
    ingredients = [],
    selectedIds = [],
    onToggle,
    onClearAll,
    placeholder = "Search and select ingredients..."
}) {
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

    // Scroll the highlighted row into view.
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.children[highlightedIndex];
            if (item) item.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    // Set of selected IDs for O(1) membership checks.
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    // Empty query → full A–Z list.
    // Typed query → prefix matches (A–Z) before substring matches (A–Z).
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

    // Resolved ingredient objects for the chips row.
    const selectedIngredients = useMemo(
        () =>
            selectedIds
                .map((id) => ingredients.find((i) => i.ingredientId === id))
                .filter(Boolean),
        [selectedIds, ingredients]
    );

    function handleInputChange(event) {
        setQuery(event.target.value);
        setHighlightedIndex(-1);
        setIsOpen(true);
    }

    function handleInputFocus() {
        setIsOpen(true);
    }

    function handleToggle(ingredient) {
        onToggle(ingredient);
        setQuery("");
        setHighlightedIndex(-1);
        // Keep dropdown open so the user can continue picking.
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
                if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
                    handleToggle(suggestions[highlightedIndex]);
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
        <div className="multi-picker" ref={containerRef}>
            {/* ── Trigger / search input ── */}
            <div className="multi-picker-control">
                <input
                    ref={inputRef}
                    type="text"
                    className={`multi-picker-input${isOpen ? " multi-picker-input--open" : ""}`}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onClick={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoComplete="off"
                />
                <span className="multi-picker-arrow" aria-hidden="true">
                    {isOpen ? "▴" : "▾"}
                </span>
            </div>

            {/* ── Dropdown list ── */}
            {isOpen && (
                <div className="multi-picker-dropdown" ref={listRef}>
                    {suggestions.length === 0 ? (
                        <div className="multi-picker-empty">
                            No matching ingredients
                        </div>
                    ) : (
                        suggestions.map((ingredient, index) => {
                            const isSelected = selectedIdSet.has(
                                ingredient.ingredientId
                            );
                            const classNames = [
                                "multi-picker-option",
                                isSelected
                                    ? "multi-picker-option--selected"
                                    : "",
                                index === highlightedIndex
                                    ? "multi-picker-option--highlighted"
                                    : ""
                            ]
                                .filter(Boolean)
                                .join(" ");

                            return (
                                <button
                                    key={ingredient.ingredientId}
                                    type="button"
                                    className={classNames}
                                    onMouseDown={(event) => {
                                        // Prevent input blur before toggle fires.
                                        event.preventDefault();
                                        handleToggle(ingredient);
                                    }}
                                    onMouseEnter={() =>
                                        setHighlightedIndex(index)
                                    }
                                >
                                    <span
                                        className="multi-picker-check"
                                        aria-hidden="true"
                                    >
                                        {isSelected ? "✓" : ""}
                                    </span>
                                    {ingredient.name}
                                </button>
                            );
                        })
                    )}
                </div>
            )}

            {/* ── Selected chips (always visible when any selected) ── */}
            {selectedIngredients.length > 0 && (
                <div className="multi-picker-chips">
                    {selectedIngredients.map((ingredient) => (
                        <span
                            key={ingredient.ingredientId}
                            className="multi-picker-chip"
                        >
                            {ingredient.name}
                            <button
                                type="button"
                                className="multi-picker-chip-remove"
                                onClick={() => onToggle(ingredient)}
                                aria-label={`Remove ${ingredient.name}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}

                    <button
                        type="button"
                        className="multi-picker-clear-all"
                        onClick={onClearAll}
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}

export default MultiIngredientPicker;
