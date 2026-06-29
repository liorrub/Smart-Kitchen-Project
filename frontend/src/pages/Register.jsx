import "./Login.css";
import "./Register.css";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../services/authService";

import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import FloatingFoodBackground from "../components/FloatingFoodBackground";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PasswordField from "../components/PasswordField";
import { validateRegisterField } from "../validators/userValidator";
import { CITY_OPTIONS, COOKING_LEVEL_OPTIONS } from "../constants/options";
import CityPicker from "../components/CityPicker";
import AvatarPicker from "../components/AvatarPicker";
import { AVATAR_DEFAULT } from "../utils/avatarCatalog";

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

function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        city: "",
        age: "",
        cookingLevel: "beginner",
        username: "",
        avatarKey: AVATAR_DEFAULT
    });

    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [modalError, setModalError] = useState("");
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

            setFormData((prev) => ({ ...prev, age: digitsOnly }));

            if (touched.age) {
                setFieldErrors((prev) => ({
                    ...prev,
                    age: validateRegisterField("age", digitsOnly)
                }));
            }

            return;
        }

        setFormData((prev) => ({ ...prev, [name]: value }));

        if (touched[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: validateRegisterField(name, value)
            }));
        }
    }

    /* Returns an onBlur handler that marks a field as touched and validates it. */
    function handleBlur(name) {
        return function () {
            setTouched((prev) => ({ ...prev, [name]: true }));
            const err = validateRegisterField(name, formData[name] ?? "");
            setFieldErrors((prev) => ({ ...prev, [name]: err }));
        };
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

        setModalError("");

        // Validate all fields and surface every error at once
        const fieldsToValidate = ["firstName", "lastName", "email", "password", "city", "age", "username"];
        const newErrors = {};
        const newTouched = {};

        for (const name of fieldsToValidate) {
            newTouched[name] = true;
            newErrors[name] = validateRegisterField(name, formData[name] ?? "");
        }

        setTouched((prev) => ({ ...prev, ...newTouched }));
        setFieldErrors((prev) => ({ ...prev, ...newErrors }));

        if (fieldsToValidate.some((name) => newErrors[name])) {
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
                cookingLevel: formData.cookingLevel,
                username: formData.username.trim().toLowerCase(),
                avatarKey: formData.avatarKey
            });

            setSuccess("Your account was created successfully.");
        } catch (err) {
            console.error(err.response?.data || err);

            const code = err.response?.data?.error?.code;

            if (code === "EMAIL_ALREADY_EXISTS") {
                setFieldErrors((prev) => ({ ...prev, email: "This email is already registered." }));
                setTouched((prev) => ({ ...prev, email: true }));
            } else if (code === "USERNAME_TAKEN" || code === "INVALID_USERNAME") {
                setFieldErrors((prev) => ({ ...prev, username: "This username is already taken. Please choose another." }));
                setTouched((prev) => ({ ...prev, username: true }));
            } else {
                setModalError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page register-page">
            <MessageModal
                type={success ? "success" : "error"}
                title={success ? "Success" : "Registration Error"}
                message={success || modalError}
                buttonText={success ? "Back to Login" : "Got It 👍"}
                onClose={() => {
                    if (success) {
                        navigate("/");
                        return;
                    }

                    setModalError("");
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
                    {/* ── Personal ── */}
                    <p className="reg-section-label">Personal</p>

                    <div className="reg-form-row">
                        <FormField
                            label="First Name"
                            type="text"
                            name="firstName"
                            placeholder="First name"
                            value={formData.firstName}
                            error={fieldErrors.firstName || ""}
                            onChange={handleChange}
                            onBlur={handleBlur("firstName")}
                        />
                        <FormField
                            label="Last Name"
                            type="text"
                            name="lastName"
                            placeholder="Last name"
                            value={formData.lastName}
                            error={fieldErrors.lastName || ""}
                            onChange={handleChange}
                            onBlur={handleBlur("lastName")}
                        />
                    </div>

                    <div className="reg-form-row">
                        <div className="reg-city-wrapper">
                            <CityPicker
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                cities={CITY_OPTIONS}
                                placeholder="Search or select city..."
                            />
                            {fieldErrors.city && (
                                <small className="form-error-text reg-city-error">
                                    {fieldErrors.city}
                                </small>
                            )}
                        </div>
                        <FormField
                            label="Age"
                            type="text"
                            name="age"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="3"
                            placeholder="Your age"
                            value={formData.age}
                            error={fieldErrors.age || ""}
                            onKeyDown={preventInvalidAgeKeys}
                            onChange={handleChange}
                            onBlur={handleBlur("age")}
                        />
                    </div>

                    {/* ── Account ── */}
                    <p className="reg-section-label">Account</p>

                    <FormField
                        label="Username"
                        type="text"
                        name="username"
                        placeholder="e.g. lior_99 (letters, numbers, underscore)"
                        value={formData.username}
                        error={fieldErrors.username || ""}
                        onChange={handleChange}
                        onBlur={handleBlur("username")}
                    />

                    <FormField
                        label="Email"
                        type="text"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        error={fieldErrors.email || ""}
                        onChange={handleChange}
                        onBlur={handleBlur("email")}
                    />

                    <PasswordField
                        label="Password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        error={fieldErrors.password || ""}
                        onChange={handleChange}
                        onBlur={handleBlur("password")}
                    />

                    {/* ── Preferences ── */}
                    <p className="reg-section-label">Preferences</p>

                    <CustomSelect
                        label="Cooking Level"
                        name="cookingLevel"
                        value={formData.cookingLevel}
                        onChange={handleChange}
                        options={COOKING_LEVEL_OPTIONS}
                    />

                    {/* ── Avatar ── */}
                    <p className="reg-section-label">Avatar</p>

                    <AvatarPicker
                        value={formData.avatarKey}
                        onChange={(key) =>
                            setFormData(prev => ({ ...prev, avatarKey: key }))
                        }
                        firstName={formData.firstName}
                        lastName={formData.lastName}
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