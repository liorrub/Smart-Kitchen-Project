import "./MainLayout.css";

import { Outlet } from "react-router-dom";

import Footer from "../components/Footer";
import KitchenSidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout() {
    return (
        <div className="app-shell">
            <Navbar />

            <KitchenSidebar />

            <main className="layout-main">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}

export default MainLayout;
