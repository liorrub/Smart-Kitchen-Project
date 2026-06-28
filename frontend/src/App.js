import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PendingRecipeProvider } from "./context/PendingRecipeContext";
import { ReviewReportProvider } from "./context/ReviewReportContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
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
import RecipeManagement from "./pages/RecipeManagement";
import ChefRecipes from "./pages/ChefRecipes";
import RecipeDiscussion from "./pages/RecipeDiscussion";
import RecipePage from "./pages/RecipePage";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import FoodieMyRecipes from "./pages/FoodieMyRecipes";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
    return (
        <ErrorBoundary>
        <AuthProvider>
            <NotificationProvider>
            <PendingRecipeProvider>
            <ReviewReportProvider>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    {/* ProtectedRoute: redirects to login if not authenticated. */}
                    <Route element={<ProtectedRoute />}>

                        {/* MainLayout: renders Navbar, Sidebar, Footer, and <Outlet /> for page content. */}
                        <Route element={<MainLayout />}>

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
                                path="/recipe-management"
                                element={<RecipeManagement />}
                            />

                            <Route
                                path="/chef/my-recipes"
                                element={<ChefRecipes />}
                            />

                            <Route
                                path="/recipes/:id"
                                element={<RecipePage />}
                            />

                            <Route
                                path="/recipes/:id/discussion"
                                element={<RecipeDiscussion />}
                            />

                            <Route
                                path="/profile/:id"
                                element={<Profile />}
                            />

                            <Route
                                path="/feed"
                                element={<Feed />}
                            />

                            <Route
                                path="/foodie/my-recipes"
                                element={<FoodieMyRecipes />}
                            />

                            <Route
                                path="*"
                                element={<NotFound />}
                            />

                        </Route>

                    </Route>

                </Routes>
            </BrowserRouter>
            </ReviewReportProvider>
            </PendingRecipeProvider>
            </NotificationProvider>
        </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;