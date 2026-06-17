import "./CheckboxGroup.css";

// Format option text so it looks nicer in the UI.
export function formatCheckboxLabel(text) {
    return text
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Reusable group of checkbox options.
function CheckboxGroup({
                           label,
                           options,
                           values,
                           onChange,
                           helperText,
                           className = ""
                       }) {
    // Get the real value from either a string option or an object option.
    function getOptionValue(option) {
        return typeof option === "string"
            ? option
            : option.value;
    }

    // Get the text that should be shown next to the checkbox.
    function getOptionLabel(option) {
        if (typeof option !== "string") {
            return option.label;
        }

        return formatCheckboxLabel(option);
    }

    // Render the label, all checkboxes, and optional helper text.
    return (
        <div className={`checkbox-group-wrapper ${className}`}>
            <label className="checkbox-group-label">
                {label}
            </label>

            <div className="checkbox-group">
                {options.map((option) => {
                    const optionValue = getOptionValue(option);
                    const optionLabel = getOptionLabel(option);

                    return (
                        <label
                            key={optionValue}
                            className="checkbox-option"
                        >
                            <input
                                type="checkbox"
                                checked={values.includes(optionValue)}
                                onChange={() => onChange(optionValue)}
                            />

                            <span>
                                {optionLabel}
                            </span>
                        </label>
                    );
                })}
            </div>

            {helperText && (
                <small className="checkbox-group-helper">
                    {helperText}
                </small>
            )}
        </div>
    );
}

export default CheckboxGroup;