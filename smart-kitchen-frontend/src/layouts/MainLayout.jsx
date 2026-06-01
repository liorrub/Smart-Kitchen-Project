import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

function MainLayout() {
    return (
        <>
            <Navbar />

            <div>
                <Sidebar />

                <main>
                    <Outlet />
                </main>
            </div>

            <Footer />
        </>
    );
}

export default MainLayout;