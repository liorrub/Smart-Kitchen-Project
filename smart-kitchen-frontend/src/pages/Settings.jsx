import "./Settings.css";

import { useEffect, useState } from "react";

import { validateSettings } from "../validators/settingsValidator";
import { getSettings, updateSettings } from "../services/settingsService";
import { useAuth } from "../context/AuthContext";

function formatText(value) {
    if (!value) {
        return "Unknown";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

const cookingLevelOptions = [
    {
        value: "beginner",
        label: "Beginner"
    },
    {
        value: "intermediate",
        label: "Intermediate"
    },
    {
        value: "advanced",
        label: "Advanced"
    }
];

const themeOptions = [
    {
        value: "light",
        label: "Light"
    },
    {
        value: "dark",
        label: "Dark"
    }
];

function CustomSelect({
                          label,
                          name,
                          value,
                          options,
                          onChange
                      }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(
        (option) => option.value === value
    );

    function handleSelect(optionValue) {
        onChange({
            target: {
                name,
                value: optionValue
            }
        });

        setIsOpen(false);
    }

    return (
        <div className="form-field custom-select-field">
            <label>{label}</label>

            <div className={isOpen ? "custom-select open" : "custom-select"}>
                <button
                    type="button"
                    className="custom-select-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>
                        {selectedOption?.label || "Select option"}
                    </span>

                    <span className="custom-select-arrow">
                        {isOpen ? "▲" : "▼"}
                    </span>
                </button>

                {isOpen && (
                    <div className="custom-select-menu">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={
                                    option.value === value
                                        ? "custom-select-option selected"
                                        : "custom-select-option"
                                }
                                onClick={() => handleSelect(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Settings() {
    const { setUser } = useAuth();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        cookingLevel: "beginner",
        age: "",
        theme: "light"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const userInitials =
        `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();

    useEffect(() => {
        async function loadSettings() {
            try {
                setLoading(true);
                setError("");

                const response = await getSettings();
                const currentUser = response.data;

                setFormData({
                    firstName: currentUser.firstName || "",
                    lastName: currentUser.lastName || "",
                    email: currentUser.email || "",
                    cookingLevel: currentUser.cookingLevel || "beginner",
                    age: currentUser.age || "",
                    theme:
                        currentUser.theme ||
                        localStorage.getItem("theme") ||
                        "light"
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        setSuccess("");
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSuccess("");
        setError("");

        const validationError = validateSettings(formData);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);

            const response = await updateSettings({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                cookingLevel: formData.cookingLevel,
                age: Number(formData.age),
                theme: formData.theme
            });

            localStorage.setItem("theme", formData.theme);
            localStorage.setItem("user", JSON.stringify(response.data));

            setUser(response.data);

            setSuccess("Settings saved successfully.");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="settings-page">
                <div className="settings-message-card">
                    <h1>Loading settings...</h1>
                    <p>Please wait while we prepare your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page">
            {success && (
                <div className="settings-toast">
                    <div className="toast-icon">
                        ✓
                    </div>

                    <div className="toast-content">
                        <strong>Success</strong>
                        <p>{success}</p>
                    </div>

                    <button
                        type="button"
                        className="toast-close-button"
                        onClick={() => setSuccess("")}
                    >
                        ×
                    </button>
                </div>
            )}

            <section className="settings-hero">
                <div className="settings-hero-text">
                    <p className="settings-label">User Settings</p>

                    <h1>Personalize your Smart Kitchen profile</h1>

                    <p className="settings-description">
                        Update your personal information, cooking level and display preference.
                    </p>
                </div>

                <div className="settings-summary-card">
                    <div className="summary-top">
                        <div className="summary-avatar">
                            {userInitials || "SK"}
                        </div>

                        <div>
                            <span>Current Profile</span>

                            <strong>
                                {formData.firstName} {formData.lastName}
                            </strong>

                            <p>{formData.email}</p>
                        </div>
                    </div>

                    <div className="summary-tags">
                        <span>{formatText(formData.cookingLevel)}</span>
                        <span>{formData.age} years old</span>
                        <span>{formatText(formData.theme)} theme</span>
                    </div>
                </div>
            </section>

            <section className="settings-card">
                <div className="settings-card-header">
                    <div>
                        <h2>Profile Settings</h2>
                        <p>Edit your details and save your changes.</p>
                    </div>
                </div>

                {error && (
                    <div className="settings-alert error">
                        {error}
                    </div>
                )}

                <form
                    className="settings-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="settings-grid">
                        <div className="form-field">
                            <label>First Name</label>

                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter first name"
                            />
                        </div>

                        <div className="form-field">
                            <label>Last Name</label>

                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter last name"
                            />
                        </div>

                        <div className="form-field">
                            <label>Email</label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                            />
                        </div>

                        <div className="form-field">
                            <label>Age</label>

                            <input
                                type="number"
                                name="age"
                                min="1"
                                max="120"
                                value={formData.age}
                                onChange={handleChange}
                                placeholder="Enter age"
                            />
                        </div>

                        <CustomSelect
                            label="Cooking Level"
                            name="cookingLevel"
                            value={formData.cookingLevel}
                            options={cookingLevelOptions}
                            onChange={handleChange}
                        />

                        <CustomSelect
                            label="Theme Preference"
                            name="theme"
                            value={formData.theme}
                            options={themeOptions}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="settings-actions">
                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Settings;