import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <aside>
            <ul>

                <li>
                    <NavLink to="/dashboard">
                        Dashboard
                    </NavLink>
                </li>

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
                    <NavLink to="/ai">
                        AI Assistant
                    </NavLink>
                </li>

                <li>
                    <NavLink to="/settings">
                        Settings
                    </NavLink>
                </li>

            </ul>
        </aside>
    );
}

export default Sidebar;