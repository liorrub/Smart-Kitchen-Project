import { NavLink } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Sidebar() {

    const { user } = useAuth();

    return (
        <aside>

            <ul>

                <li>
                    <NavLink to="/recipes">
                        Recipes
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/favorites">
                        Favorites
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/pantry">
                        Pantry
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/meal-planner">
                        Meal Planner
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/shopping-list">
                        Shopping List
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/ai-assistant">
                        AI Assistant
                    </NavLink>
                </li>

                {
                    user?.userRole === "admin" && (
                        <>
                            <li>
                                <NavLink to="/users">
                                    Users Management
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/ingredients">
                                    Ingredients Management
                                </NavLink>
                            </li>

                            <li>
                                <NavLink to="/ai-history">
                                    AI History
                                </NavLink>
                            </li>
                        </>
                    )
                }

            </ul>

        </aside>
    );
}

export default Sidebar;