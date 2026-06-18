import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

// Protect pages that require authentication
function ProtectedRoute() {

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

    return <Outlet />;
}

export default ProtectedRoute;