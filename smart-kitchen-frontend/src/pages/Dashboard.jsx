import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getCurrentUser } from "../services/authService";


function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const storedUser = JSON.parse(
                    localStorage.getItem("user")
                );

                if (!storedUser) {
                    navigate("/");
                    return;
                }

                const response = await getCurrentUser(
                    storedUser.userId
                );

                setUser(response.data);
            }
            catch (error) {
                console.error(error);
            }
        }

        loadUser();
    }, [navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Navbar user={user} />

            <div>
                <h1>
                    Smart Kitchen Dashboard
                </h1>
            </div>

            <Footer />
        </>
    );
}

export default Dashboard;