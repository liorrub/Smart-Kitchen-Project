import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Favorites from "./pages/Favorites";
import Pantry from "./pages/Pantry";
import MealPlanner from "./pages/MealPlanner";
import ShoppingList from "./pages/ShoppingList";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Users from "./pages/Users";
import Ingredients from "./pages/Ingredients";
import AIHistory from "./pages/AIHistory";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        element={
                            <ProtectedRoute>
                                <MainLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/recipes"
                            element={<Recipes />}
                        />

                        <Route
                            path="/favorites"
                            element={<Favorites />}
                        />

                        <Route
                            path="/pantry"
                            element={<Pantry />}
                        />

                        <Route
                            path="/meal-planner"
                            element={<MealPlanner />}
                        />

                        <Route
                            path="/shopping-list"
                            element={<ShoppingList />}
                        />

                        <Route
                            path="/ai-assistant"
                            element={<AIAssistant />}
                        />

                        <Route
                            path="/settings"
                            element={<Settings />}
                        />

                        <Route
                            path="/users"
                            element={<Users />}
                        />

                        <Route
                            path="/ingredients"
                            element={<Ingredients />}
                        />

                        <Route
                            path="/ai-history"
                            element={<AIHistory />}
                        />

                    </Route>

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;