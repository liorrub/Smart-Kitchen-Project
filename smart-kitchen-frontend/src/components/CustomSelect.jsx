import { useEffect, useRef, useState } from "react";

import "./CustomSelect.css";

/*
    Converts both string options and object options into the same format.
    Supports:
    "beginner"
    or
    { value: "beginner", label: "Beginner" }
*/
function normalizeOption(option) {
    if (typeof option === "string") {
        return {
            value: option,
            label: formatLabel(option)
        };
    }

    return option;
}

/*
    Formats labels like:
    gluten-free -> Gluten-Free
*/
function formatLabel(text) {
    return String(text)
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
}

/*
    Reusable custom select component.
    Used instead of repeating dropdown logic inside pages.
*/
function CustomSelect({
                          label,
                          name,
                          id,
                          value,
                          onChange,
                          options = [],
                          disabled = false,
                          placeholder = "Choose option",
                          helperText = "",
                          className = ""
                      }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectRef = useRef(null);
    const selectId = id || name;

    const normalizedOptions = options.map(normalizeOption);

    const selectedOption = normalizedOptions.find(
        (option) => String(option.value) === String(value)
    );

    /*
        Closes the dropdown when clicking outside of it.
    */
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleSelect(option) {
        onChange({
            target: {
                name,
                value: option.value
            }
        });

        setIsOpen(false);
    }

    return (
        <div
            className={`custom-select-field ${className}`.trim()}
            ref={selectRef}
        >
            {label && (
                <label htmlFor={selectId}>
                    {label}
                </label>
            )}

            <div className={isOpen ? "custom-select open" : "custom-select"}>
                <button
                    id={selectId}
                    type="button"
                    className="custom-select-trigger"
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen((current) => !current);
                        }
                    }}
                    disabled={disabled}
                >
                    <span>
                        {selectedOption?.label || placeholder}
                    </span>

                    <span className="custom-select-arrow">
                        {isOpen ? "▲" : "▼"}
                    </span>
                </button>

                {isOpen && (
                    <div className="custom-select-menu">
                        {normalizedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    String(option.value) === String(value)
                                        ? "custom-select-option selected"
                                        : "custom-select-option"
                                }
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {helperText && (
                <small className="custom-select-helper">
                    {helperText}
                </small>
            )}
        </div>
    );
}

export default CustomSelect;