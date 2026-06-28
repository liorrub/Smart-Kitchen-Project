import "./NotFound.css";

import { useNavigate } from "react-router-dom";

import AppButton from "../components/AppButton";

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="not-found-page">
            <div className="not-found-card">
                <p className="not-found-code">404</p>

                <h1 className="not-found-title">Page Not Found</h1>

                <p className="not-found-message">
                    Looks like this page wandered off the menu.
                    <br />
                    Let's get you back to something delicious.
                </p>

                <AppButton
                    type="button"
                    variant="danger"
                    size="large"
                    onClick={() => navigate("/feed")}
                >
                    Back to Feed
                </AppButton>
            </div>
        </div>
    );
}

export default NotFound;
