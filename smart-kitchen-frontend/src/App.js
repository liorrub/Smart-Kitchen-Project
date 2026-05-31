import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";

import MainLayout from "./layouts/MainLayout";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>

                <Routes>

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route element={<MainLayout />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/settings"
                            element={<Settings />}
                        />

                    </Route>

                </Routes>

            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;