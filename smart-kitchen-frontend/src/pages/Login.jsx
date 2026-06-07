import "./Login.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppButton from "../components/AppButton";
import FloatingFoodBackground from "../components/FloatingFoodBackground";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PasswordField from "../components/PasswordField";

import { login } from "../services/authService";
import { validateLogin } from "../validators/userValidator";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/logo.png";

import login1 from "../assets/login1.png";
import login2 from "../assets/login2.png";
import login3 from "../assets/login3.png";
import login4 from "../assets/login4.png";
import login5 from "../assets/login5.png";
import login6 from "../assets/login6.png";
import login7 from "../assets/login7.png";
import login8 from "../assets/login8.png";
import login9 from "../assets/login9.png";
import login10 from "../assets/login10.png";
import login11 from "../assets/login11.png";
import login12 from "../assets/login12.png";
import login13 from "../assets/login13.png";
import login14 from "../assets/login14.png";

/* Text displayed under the logo */
const subtitles = [
    "Plan healthy meals",
    "Track your pantry",
    "Create shopping lists",
    "Get AI cooking advice",
    "Cook smarter every day"
];

/* Food images used by the floating background */
const foodImages = [
    login1,
    login2,
    login3,
    login4,
    login5,
    login6,
    login7,
    login8,
    login9,
    login10,
    login11,
    login12,
    login13,
    login14
];

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [subtitleIndex, setSubtitleIndex] = useState(0);

    const cardRef = useRef(null);

    const navigate = useNavigate();
    const { setUser } = useAuth();

    /* Changes the subtitle every few seconds */
    useEffect(() => {
        const interval = setInterval(() => {
            setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        const validationError = validateLogin(email, password);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const result = await login(email, password);

            setUser(result.data);

            localStorage.setItem(
                "user",
                JSON.stringify(result.data)
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(error);

            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            <MessageModal
                type="error"
                title="Login Error"
                message={error}
                onClose={() => setError("")}
            />

            <FloatingFoodBackground
                images={foodImages}
                avoidRef={cardRef}
            />

            <div
                className="login-card"
                ref={cardRef}
            >
                <img
                    src={logo}
                    alt="Smart Kitchen"
                    className="login-logo"
                />

                <p
                    key={subtitleIndex}
                    className="login-subtitle"
                >
                    {subtitles[subtitleIndex]}
                </p>

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <FormField
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value);
                            setError("");
                        }}
                    />

                    <PasswordField
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError("");
                        }}
                    />

                    <AppButton
                        type="submit"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? "Logging in..." : "Login"}
                    </AppButton>
                </form>

                <div className="register-section">
                    <p>Don't have an account?</p>

                    <AppButton
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={() => navigate("/register")}
                    >
                        Sign Up
                    </AppButton>
                </div>
            </div>
        </div>
    );
}

export default Login;