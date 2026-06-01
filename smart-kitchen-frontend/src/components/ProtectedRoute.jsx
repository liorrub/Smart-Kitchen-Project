import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// Protect pages that require authentication
function ProtectedRoute({ children }) {

    const { user } = useAuth();

    // Redirect to login page if user is not logged in
    if (!user) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;