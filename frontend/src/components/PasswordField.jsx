import { useState } from "react";
import "./PasswordField.css";

function PasswordField({
                           label = "Password",
                           name = "password",
                           value,
                           onChange,
                           placeholder = "Enter your password",
                           disabled = false,
                           className = "",
                           error = "",
                           ...props
                       }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={`form-field password-field${error ? " password-field--invalid" : ""} ${className}`.trim()}>
            {label && (
                <label htmlFor={name}>
                    {label}
                </label>
            )}

            <div className="password-field-wrapper">
                <input
                    id={name}
                    type={showPassword ? "text" : "password"}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    {...props}
                />

                <button
                    type="button"
                    className="password-toggle-button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={disabled}
                >
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>

            {error && (
                <small className="form-error-text">
                    {error}
                </small>
            )}
        </div>
    );
}

export default PasswordField;
