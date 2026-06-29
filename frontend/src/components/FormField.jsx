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
                       ...props
                   }) {
    const inputId = id || name;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
        <div className={`form-field ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId}>
                    {label}
                </label>
            )}

            <input
                id={inputId}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={errorId}
                {...props}
            />

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
    );
}

export default FormField;
