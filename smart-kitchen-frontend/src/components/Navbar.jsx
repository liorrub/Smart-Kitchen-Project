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
            navigate("/");
        }
    }

    return (
        <nav>
            <div>
                <h2>Smart Kitchen</h2>
            </div>

            <div>
                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/settings">
                    Settings
                </Link>
            </div>

            <div>
                <span>
                    Welcome, {user?.firstName || "User"}
                </span>

                <button
                    type="button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;