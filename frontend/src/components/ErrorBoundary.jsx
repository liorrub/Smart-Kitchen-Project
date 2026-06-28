import "./ErrorBoundary.css";

import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught a render error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-page">
                    <div className="error-boundary-card">
                        <p className="error-boundary-icon">⚠️</p>

                        <h1 className="error-boundary-title">
                            Something went wrong.
                        </h1>

                        <p className="error-boundary-message">
                            Please refresh the page or try again later.
                        </p>

                        <button
                            type="button"
                            className="error-boundary-button"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
