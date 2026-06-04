import "./FormCard.css";

function FormCard({
                      label,
                      title,
                      description,
                      children,
                      actions,
                      className = ""
                  }) {
    return (
        <section className={`form-card ${className}`.trim()}>
            {(label || title || description) && (
                <div className="form-card-header">
                    {label && (
                        <p className="form-card-label">
                            {label}
                        </p>
                    )}

                    {title && (
                        <h2>
                            {title}
                        </h2>
                    )}

                    {description && (
                        <p className="form-card-description">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children}

            {actions && (
                <div className="form-card-actions">
                    {actions}
                </div>
            )}
        </section>
    );
}

export default FormCard;
