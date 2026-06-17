import "./AppButton.css";

// Reusable button component for the app.
function AppButton({
                       children,
                       type = "button",
                       variant = "primary",
                       size = "medium",
                       fullWidth = false,
                       disabled = false,
                       className = "",
                       onClick,
                       ...props
                   }) {
    // Build the final class list according to the button props.
    const buttonClassName = [
        "app-button",
        `app-button-${variant}`,
        `app-button-${size}`,
        fullWidth ? "app-button-full" : "",
        className
    ]
        // Remove empty class names before joining them.
        .filter(Boolean)
        .join(" ");

    // Render the button and pass any extra props to it.
    return (
        <button
            type={type}
            className={buttonClassName}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
}

export default AppButton;