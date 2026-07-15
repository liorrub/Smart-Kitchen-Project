import "./CustomSelect.css";

import { useEffect, useMemo, useRef, useState } from "react";

/*
    Reusable styled select component.
    It sends changes in the same shape as a normal input event:
    { target: { name, value } }
*/
function CustomSelect({
                          label,
                          name,
                          value,
                          onChange,
                          options = [],
                          placeholder = "Choose option",
                          helperText = "",
                          disabled = false,
                          wrapperClassName = ""
                      }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const normalizedOptions = useMemo(() => {
        return options.map((option) => {
            if (typeof option === "string") {
                return {
                    value: option,
                    label: option
                };
            }

            return {
                value: option.value,
                label: option.label
            };
        });
    }, [options]);

    const selectedOption = normalizedOptions.find(
        (option) => String(option.value) === String(value)
    );

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

    function handleToggle() {
        if (disabled) {
            return;
        }

        setIsOpen((previousState) => !previousState);
    }

    function handleSelect(optionValue) {
        onChange({
            target: {
                name,
                value: optionValue
            }
        });

        setIsOpen(false);
    }

    return (
        <div
            className={`custom-select-field ${wrapperClassName}`.trim()}
            ref={selectRef}
        >
            {label && (
                <label htmlFor={`${name}-custom-select`}>
                    {label}
                </label>
            )}

            <div className="custom-select-wrapper">
                <button
                    id={`${name}-custom-select`}
                    type="button"
                    className={
                        isOpen
                            ? "custom-select-button open"
                            : "custom-select-button"
                    }
                    onClick={handleToggle}
                    disabled={disabled}
                >
                    <span title={selectedOption?.label || placeholder}>
                        {selectedOption?.label || placeholder}
                    </span>

                    <span className="custom-select-arrow">
                        ▾
                    </span>
                </button>

                {isOpen && (
                    <div className="custom-select-options">
                        {normalizedOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    String(option.value) === String(value)
                                        ? "custom-select-option selected"
                                        : "custom-select-option"
                                }
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {helperText && (
                <p className="custom-select-helper">
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default CustomSelect;
