import { Link, useNavigate } from "react-router-dom";

import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Navbar() {

    const { user, setUser } = useAuth();

    const navigate = useNavigate();

    async function handleLogout() {

        try {
            await logout();
        }
        catch (error) {
            console.error(error);
        }
        finally {

            localStorage.removeItem("user");

            setUser(null);

            // Replace history entry after logout
            navigate(
                "/",
                {
                    replace: true
                }
                );
        }
    }

    return (
        <nav>

            <h2>
                Smart Kitchen
            </h2>

            <div>

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/settings">
                    Settings
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

            <p>
                Welcome, {user?.firstName}
            </p>

        </nav>
    );
}

export default Navbar;