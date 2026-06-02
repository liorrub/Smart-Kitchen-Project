import "./Settings.css";
import PageHero from "../components/PageHero";
import { useEffect, useState } from "react";
import { validateSettings } from "../validators/settingsValidator";
import { getSettings, updateSettings, changePassword } from "../services/settingsService";
import { useAuth } from "../context/AuthContext";

// Constants
const COOKING_LEVELS = ["beginner", "intermediate", "advanced"];
const DIETARY_OPTIONS = ["vegan", "vegetarian", "gluten-free", "dairy-free", "nut-free", "keto", "low-carb"];
const CUISINE_OPTIONS = ["italian", "asian", "mexican", "american", "israeli"];

function formatLabel(text) {
    return text
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join("-");
}

// Custom Select Component
function CustomSelect({ label, name, value, options, onChange }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="form-field custom-select-field">
            <label>{label}</label>
            <div className={isOpen ? "custom-select open" : "custom-select"}>
                <button
                    type="button"
                    className="custom-select-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{formatLabel(value)}</span>
                    <span className="custom-select-arrow">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                    <div className="custom-select-menu">
                        {options.map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={option === value ? "custom-select-option selected" : "custom-select-option"}
                                onClick={() => {
                                    onChange({ target: { name, value: option } });
                                    setIsOpen(false);
                                }}
                            >
                                {formatLabel(option)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Checkbox Group Component
function CheckboxGroup({ label, options, values, onChange }) {
    return (
        <div className="checkbox-group-wrapper">
            <label className="checkbox-group-label">{label}</label>
            <div className="checkbox-group">
                {options.map((option) => (
                    <label key={option} className="checkbox-option">
                        <input
                            type="checkbox"
                            checked={values.includes(option)}
                            onChange={() => onChange(option)}
                        />
                        <span>{formatLabel(option)}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

// Main Settings Component
function Settings() {
    const { user, setUser } = useAuth();

    // Profile form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        age: "",
        cookingLevel: "beginner",
        preferences: { dietary: [], cuisine: [] }
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    // Derived values
    const userInitials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    const preferenceCount = formData.preferences.dietary.length + formData.preferences.cuisine.length;

    // Load settings on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                setLoading(true);
                const response = await getSettings();
                const data = response.data;
                setFormData({
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    age: data.age || "",
                    cookingLevel: data.cookingLevel || "beginner",
                    preferences: {
                        dietary: data.preferences?.dietary || [],
                        cuisine: data.preferences?.cuisine || []
                    }
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

    // Profile form handlers
    function handleChange(event) {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setSuccess("");
        setError("");
    }

    function togglePreference(type, option) {
        setFormData(prev => {
            const currentValues = prev.preferences[type];
            return {
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [type]: currentValues.includes(option)
                        ? currentValues.filter(item => item !== option)
                        : [...currentValues, option]
                }
            };
        });
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
                age: Number(formData.age),
                cookingLevel: formData.cookingLevel,
                preferences: formData.preferences
            });
            localStorage.setItem("user", JSON.stringify(response.data));
            setUser(response.data);
            setSuccess("Settings saved successfully.");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }

    // Password form handlers
    function handlePasswordChange(event) {
        const { name, value } = event.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setPasswordError("");
        setPasswordSuccess("");
    }

    async function handlePasswordSubmit(event) {
        event.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        // Validation
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("Please fill all password fields");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New password and confirm password do not match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setPasswordError("New password must be at least 6 characters");
            return;
        }

        try {
            setChangingPassword(true);
            console.log("[handlePasswordSubmit] Changing password for user:", user?.userId);
            console.log("[handlePasswordSubmit] User object:", user);

            await changePassword(user.userId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordSuccess("Password changed successfully.");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            console.error("[handlePasswordSubmit] Error:", err);
            const errorMessage =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                err.message ||
                "Failed to change password.";
            setPasswordError(errorMessage);
        } finally {
            setChangingPassword(false);
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
            {/* Success Toast */}
            {(success || passwordSuccess) && (
                <div className="settings-toast">
                    <div className="toast-icon">✓</div>
                    <div className="toast-content">
                        <strong>Success</strong>
                        <p>{success || passwordSuccess}</p>
                    </div>
                    <button
                        type="button"
                        className="toast-close-button"
                        onClick={() => {
                            setSuccess("");
                            setPasswordSuccess("");
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Hero Section */}
            <PageHero
                label="User Settings"
                title="Personalize your Smart Kitchen profile"
                description="Update your personal information, cooking level, and food preferences."
            >
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
                        <span>{formatLabel(formData.cookingLevel)}</span>
                        <span>{formData.age} years old</span>

                        {preferenceCount > 0 && (
                            <span>
                                {preferenceCount} food preference
                                {preferenceCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>
            </PageHero>

            {/* Profile Settings Card */}
            <section className="settings-card">
                <div className="settings-card-header">
                    <h2>Profile Settings</h2>
                    <p>Edit your details and food preferences.</p>
                </div>
                {error && <div className="settings-alert error">{error}</div>}
                <form className="settings-form" onSubmit={handleSubmit} noValidate>
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
                            options={COOKING_LEVELS}
                            onChange={handleChange}
                        />
                    </div>
                    <CheckboxGroup
                        label="Dietary Preferences"
                        options={DIETARY_OPTIONS}
                        values={formData.preferences.dietary}
                        onChange={(option) => togglePreference("dietary", option)}
                    />
                    <CheckboxGroup
                        label="Favorite Cuisines"
                        options={CUISINE_OPTIONS}
                        values={formData.preferences.cuisine}
                        onChange={(option) => togglePreference("cuisine", option)}
                    />
                    <div className="settings-actions">
                        <button type="submit" disabled={saving}>
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Security Settings Card */}
            <section className="settings-card">
                <div className="settings-card-header">
                    <h2>Security Settings</h2>
                    <p>Change your account password.</p>
                </div>
                {passwordError && <div className="settings-alert error">{passwordError}</div>}
                <form className="settings-form" onSubmit={handlePasswordSubmit} noValidate>
                    <div className="password-visibility-toggle">
                        <button
                            type="button"
                            className="show-password-button"
                            onClick={() => setShowPasswords(!showPasswords)}
                        >
                            {showPasswords ? "Hide passwords" : "Show passwords"}
                        </button>
                    </div>
                    <div className="settings-grid">
                        <div className="form-field">
                            <label>Current Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="form-field">
                            <label>New Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="form-field">
                            <label>Confirm Password</label>
                            <input
                                type={showPasswords ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                    <div className="settings-actions">
                        <button type="submit" disabled={changingPassword}>
                            {changingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Settings;