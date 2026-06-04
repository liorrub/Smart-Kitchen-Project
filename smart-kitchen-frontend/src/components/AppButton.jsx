import "./AppButton.css";

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
    const buttonClassName = [
        "app-button",
        `app-button-${variant}`,
        `app-button-${size}`,
        fullWidth ? "app-button-full" : "",
        className
    ]
        .filter(Boolean)
        .join(" ");

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
