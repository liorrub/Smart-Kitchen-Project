import "./PageHero.css";

function PageHero({
                      label,
                      title,
                      description,
                      stats = [],
                      children
                  }) {
    const hasStats = Array.isArray(stats) && stats.length > 0;
    const hasCustomContent = Boolean(children);

    const heroClasses = [
        "page-hero",
        hasCustomContent ? "page-hero-with-custom-content" : "",
        !hasCustomContent && stats.length >= 5 ? "page-hero-many-stats" : ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <section className={heroClasses}>
            <div className="page-hero-text">
                {label && (
                    <p className="page-hero-label">
                        {label}
                    </p>
                )}

                <h1>{title}</h1>

                {description && (
                    <p className="page-hero-description">
                        {description}
                    </p>
                )}
            </div>

            {hasCustomContent && (
                <div className="page-hero-side">
                    {children}
                </div>
            )}

            {!hasCustomContent && hasStats && (
                <div className="page-hero-stats">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="page-hero-stat-card"
                        >
                            <span>{stat.value}</span>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default PageHero;
