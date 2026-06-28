import "./PageErrorState.css";

function PageErrorState({ title, message, onRetry, retryText = "Try Again" }) {
    return (
        <div className="page-error-state">
            <div className="page-error-state__card">
                <p className="page-error-state__icon">⚠️</p>

                <h2 className="page-error-state__title">{title}</h2>

                <p className="page-error-state__message">{message}</p>

                {onRetry && (
                    <button
                        type="button"
                        className="page-error-state__button"
                        onClick={onRetry}
                    >
                        {retryText}
                    </button>
                )}
            </div>
        </div>
    );
}

export default PageErrorState;
