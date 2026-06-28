import "./MainLayout.css";

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import KitchenSidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import NotificationToastContainer from "../components/NotificationToast";

// Fetches the current year from worldtimeapi.org and passes it down to Footer
function MainLayout() {
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetch("https://worldtimeapi.org/api/timezone/Etc/UTC")
            .then((res) => res.json())
            .then((data) => {
                const currentYear = new Date(data.datetime).getFullYear();
                setYear(currentYear);
            })
            .catch(() => {
                // Keep the local fallback year if the API is unavailable
            });
    }, []);

    return (
        <div className="app-shell">
            <Navbar />

            <KitchenSidebar />

            <main className="layout-main">
                <Outlet />
            </main>

            <Footer year={year} />
            <NotificationToastContainer />
        </div>
    );
}

export default MainLayout;
