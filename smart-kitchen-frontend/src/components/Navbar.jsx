import "./Navbar.css";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import { logout } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { getStoredUser } from "../utils/authUtils";

const menuLinks = [
    {
        to: "/recipes",
        label: "Recipes"
    },
    {
        to: "/favorites",
        label: "Favorites"
    },
    {
        to: "/pantry",
        label: "Pantry"
    },
    {
        to: "/meal-planner",
        label: "Meal Planner"
    },
    {
        to: "/shopping-list",
        label: "Shopping List"
    },
    {
        to: "/ai-assistant",
        label: "AI Assistant"
    },
    {
        to: "/discover",
        label: "Discover"
    }
];

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { user, setUser } = useAuth();

    const navigate = useNavigate();

    // Clear the session and redirect to the login page, even if the server-side logout call fails.
    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error(error);
        } finally {
            // Always clear local state even if the API call fails.
            sessionStorage.removeItem("user");
            setUser(null);

            navigate("/", {
                replace: true
            });
        }
    }

    return (
        <header className="navbar">
            <div className="navbar-brand">
                <img
                    src={logo}
                    alt="Smart Kitchen"
                    className="navbar-logo-image"
                />
            </div>

            <nav className="navbar-links">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        isActive ? "navbar-link active" : "navbar-link"
                    }
                >
                    Dashboard
                </NavLink>

                <div className="navbar-menu-wrapper">
                    <button
                        type="button"
                        className={
                            isMenuOpen
                                ? "navbar-link menu-button active"
                                : "navbar-link menu-button"
                        }
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        Menu
                        <span className="menu-arrow">
                            {isMenuOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    {isMenuOpen && (
                        <div className="navbar-dropdown">
                            {menuLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        isActive
                                            ? "dropdown-link active"
                                            : "dropdown-link"
                                    }
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </div>

                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        isActive ? "navbar-link active" : "navbar-link"
                    }
                >
                    Settings
                </NavLink>
            </nav>

            <div className="navbar-user">
                <NavLink
                    to={`/profile/${user?.userId || getStoredUser()?.userId}`}
                    className="user-pill user-pill-link"
                    title="View my profile"
                >
                    <span>Welcome</span>
                    <strong>{user?.firstName || "User"}</strong>
                </NavLink>

                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Navbar;