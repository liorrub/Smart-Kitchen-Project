import "./CheckboxGroup.css";

export function formatCheckboxLabel(text) {
    return text
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
}

function CheckboxGroup({
                           label,
                           options,
                           values,
                           onChange,
                           helperText,
                           className = ""
                       }) {
    function getOptionValue(option) {
        return typeof option === "string"
            ? option
            : option.value;
    }

    function getOptionLabel(option) {
        if (typeof option !== "string") {
            return option.label;
        }

        return formatCheckboxLabel(option);
    }

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