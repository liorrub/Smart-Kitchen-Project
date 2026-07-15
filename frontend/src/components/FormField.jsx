import "./FormField.css";

function FormField({
                       label,
                       name,
                       id,
                       type = "text",
                       value,
                       onChange,
                       placeholder = "",
                       disabled = false,
                       required = false,
                       helperText = "",
                       error = "",
                       className = "",
                       maxLength,
                       showCounter = false,
                       multiline = false,
                       rows = 4,
                       ...props
                   }) {
    const inputId = id || name;
    const errorId = error ? `${inputId}-error` : undefined;
    // Only show a counter when there's a real maxLength to count against —
    // never invent an artificial limit just to display one.
    const shouldShowCounter = showCounter && Boolean(maxLength);
    const Element = multiline ? "textarea" : "input";

    return (
        <div className={`form-field ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId}>
                    {label}
                </label>
            )}

            <Element
                id={inputId}
                type={multiline ? undefined : type}
                rows={multiline ? rows : undefined}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                maxLength={maxLength}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={errorId}
                {...props}
            />

            <div className="form-field-footer">
                <div>
                    {helperText && !error && (
                        <small className="form-helper-text">
                            {helperText}
                        </small>
                    )}

                    {error && (
                        <small id={errorId} className="form-error-text">
                            {error}
                        </small>
                    )}
                </div>

                {shouldShowCounter && (
                    <small className="form-field-counter">
                        {String(value ?? "").length} / {maxLength}
                    </small>
                )}
            </div>
        </div>
    );
}

export default FormField;
