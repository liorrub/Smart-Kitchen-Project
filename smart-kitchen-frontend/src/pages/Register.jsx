import "./Login.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../services/authService";

import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import FloatingFoodBackground from "../components/FloatingFoodBackground";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PasswordField from "../components/PasswordField";

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

/* Options for the cooking level select field */
const cookingLevelOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
];

function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        city: "",
        age: "",
        cookingLevel: "beginner"
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [subtitleIndex, setSubtitleIndex] = useState(0);

    const cardRef = useRef(null);

    const navigate = useNavigate();

    /* Changes the subtitle every few seconds */
    useEffect(() => {
        const interval = setInterval(() => {
            setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    /* Handles all form field changes */
    function handleChange(event) {
        const { name, value } = event.target;

        if (name === "age") {
            const digitsOnly = value.replace(/\D/g, "");

            setFormData((prev) => ({
                ...prev,
                age: digitsOnly
            }));

            if (digitsOnly !== "" && Number(digitsOnly) > 120) {
                setError("Please enter an age between 1 and 120.");
            } else {
                setError("");
            }

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setError("");
    }

    /* Prevents invalid characters inside the age field */
    function preventInvalidAgeKeys(event) {
        const invalidKeys = ["e", "E", "+", "-", "."];

        if (invalidKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    /* Handles register form submission */
    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        if (
            !formData.firstName.trim() ||
            !formData.lastName.trim() ||
            !formData.email.trim() ||
            !formData.password.trim() ||
            !formData.city.trim() ||
            !formData.age
        ) {
            setError("All fields are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (Number(formData.age) < 1 || Number(formData.age) > 120) {
            setError("Age must be between 1 and 120");
            return;
        }

        try {
            setLoading(true);

            await register({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                city: formData.city.trim(),
                age: Number(formData.age),
                cookingLevel: formData.cookingLevel
            });

            setSuccess("Your account was created successfully.");
        } catch (error) {
            console.error(error.response?.data || error);

            let errorMessage = "Registration failed. Please try again.";

            if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            if (
                error.response?.status === 409 ||
                errorMessage.includes("EMAIL_ALREADY_EXISTS") ||
                errorMessage.includes("already exists")
            ) {
                errorMessage = "Email already exists. Please use another email or login.";
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page register-page">
            <MessageModal
                type={success ? "success" : "error"}
                title={success ? "Success" : "Registration Error"}
                message={success || error}
                buttonText={success ? "Back to Login" : "Got It 👍"}
                onClose={() => {
                    if (success) {
                        navigate("/");
                        return;
                    }

                    setError("");
                }}
            />

            <FloatingFoodBackground
                images={foodImages}
                avoidRef={cardRef}
            />

            <div
                className="login-card register-card"
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
                    onSubmit={handleSubmit}
                    noValidate
                    className="login-form"
                >
                    <FormField
                        label="First Name"
                        type="text"
                        name="firstName"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChange={handleChange}
                    />

                    <FormField
                        label="Last Name"
                        type="text"
                        name="lastName"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChange={handleChange}
                    />

                    <FormField
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                    />

                    <FormField
                        label="City"
                        type="text"
                        name="city"
                        placeholder="Enter your city"
                        value={formData.city}
                        onChange={handleChange}
                    />

                    <PasswordField
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                    />

                    <FormField
                        label="Age"
                        type="text"
                        name="age"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength="3"
                        placeholder="Enter your age"
                        value={formData.age}
                        onKeyDown={preventInvalidAgeKeys}
                        onChange={handleChange}
                    />

                    <CustomSelect
                        label="Cooking Level"
                        name="cookingLevel"
                        value={formData.cookingLevel}
                        onChange={handleChange}
                        options={cookingLevelOptions}
                    />

                    <AppButton
                        type="submit"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </AppButton>
                </form>

                <div className="register-section">
                    <p>Already have an account?</p>

                    <AppButton
                        type="button"
                        variant="outline"
                        fullWidth
                        onClick={() => navigate("/")}
                    >
                        Login
                    </AppButton>
                </div>
            </div>
        </div>
    );
}

export default Register;