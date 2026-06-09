import "./Settings.css";

import { useEffect, useState } from "react";

import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import CheckboxGroup, { formatCheckboxLabel } from "../components/CheckboxGroup";

import { useAuth } from "../context/AuthContext";
import { validateSettings } from "../validators/settingsValidator";
import {
    changePassword,
    getSettings,
    updateSettings
} from "../services/settingsService";

// Constants
const COOKING_LEVELS = ["beginner", "intermediate", "advanced"];

const DIETARY_OPTIONS = [
    "vegan",
    "vegetarian",
    "gluten-free",
    "dairy-free",
    "nut-free",
    "keto",
    "low-carb"
];

const CUISINE_OPTIONS = [
    "italian",
    "asian",
    "mexican",
    "american",
    "israeli"
];

// Main Settings component
function Settings() {
    const { user, setUser } = useAuth();

    // Profile form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        age: "",
        cookingLevel: "beginner",
        preferences: {
            dietary: [],
            cuisine: []
        }
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
    const [showPasswords, setShowPasswords] = useState(false);

    // Message states
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Derived values
    const userInitials =
        `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`
            .toUpperCase();

    const preferenceCount =
        formData.preferences.dietary.length +
        formData.preferences.cuisine.length;

    const activeSuccess = success || passwordSuccess;
    const activeError = error || passwordError;
    const activeMessage = activeSuccess || activeError;

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

    // Handles profile form changes
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

            setSuccess("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setSuccess("");
        setError("");
    }

    // Prevents invalid characters inside the age input
    function preventInvalidAgeKeys(event) {
        const invalidKeys = ["e", "E", "+", "-", "."];

        if (invalidKeys.includes(event.key)) {
            event.preventDefault();
        }
    }

    // Toggles dietary or cuisine preference values
    function togglePreference(type, option) {
        setFormData((prev) => {
            const currentValues = prev.preferences[type];

            return {
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [type]: currentValues.includes(option)
                        ? currentValues.filter((item) => item !== option)
                        : [...currentValues, option]
                }
            };
        });

        setSuccess("");
        setError("");
    }

    // Saves profile settings
    async function handleSubmit(event) {
        event.preventDefault();

        setSuccess("");
        setError("");
        setPasswordSuccess("");
        setPasswordError("");

        if (formData.age !== "" && Number(formData.age) > 120) {
            setError("Please enter an age between 1 and 120.");
            return;
        }

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

            localStorage.setItem(
                "user",
                JSON.stringify(response.data)
            );

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

    // Handles password form changes
    function handlePasswordChange(event) {
        const { name, value } = event.target;

        setPasswordData((prev) => ({
            ...prev,
            [name]: value
        }));

        setPasswordError("");
        setPasswordSuccess("");
    }

    // Changes account password
    async function handlePasswordSubmit(event) {
        event.preventDefault();

        setSuccess("");
        setError("");
        setPasswordError("");
        setPasswordSuccess("");

        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {
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

            await changePassword(user.userId, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordSuccess("Password changed successfully.");

            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
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
            <MessageModal
                type={activeSuccess ? "success" : "error"}
                title={activeSuccess ? "Success" : "Settings Error"}
                message={activeMessage}
                buttonText="Got It 👍"
                onClose={() => {
                    setSuccess("");
                    setError("");
                    setPasswordSuccess("");
                    setPasswordError("");
                }}
            />

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
                        <span>{formatCheckboxLabel(formData.cookingLevel)}</span>

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

                <form
                    className="settings-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="settings-grid">
                        <FormField
                            label="First Name"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Enter first name"
                        />

                        <FormField
                            label="Last Name"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Enter last name"
                        />

                        <FormField
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                        />

                        <FormField
                            label="Age"
                            type="text"
                            name="age"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength="3"
                            value={formData.age}
                            onKeyDown={preventInvalidAgeKeys}
                            onChange={handleChange}
                            placeholder="Enter age"
                        />

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
                        <AppButton
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </AppButton>
                    </div>
                </form>
            </section>

            {/* Security Settings Card */}
            <section className="settings-card">
                <div className="settings-card-header">
                    <h2>Security Settings</h2>

                    <p>Change your account password.</p>
                </div>

                <form
                    className="settings-form"
                    onSubmit={handlePasswordSubmit}
                    noValidate
                >
                    <div className="password-visibility-toggle">
                        <AppButton
                            type="button"
                            variant="secondary"
                            size="small"
                            onClick={() => setShowPasswords(!showPasswords)}
                        >
                            {showPasswords ? "Hide passwords" : "Show passwords"}
                        </AppButton>
                    </div>

                    <div className="settings-grid">
                        <FormField
                            label="Current Password"
                            type={showPasswords ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                        />

                        <FormField
                            label="New Password"
                            type={showPasswords ? "text" : "password"}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                        />

                        <FormField
                            label="Confirm Password"
                            type={showPasswords ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="settings-actions">
                        <AppButton
                            type="submit"
                            disabled={changingPassword}
                        >
                            {changingPassword ? "Changing..." : "Change Password"}
                        </AppButton>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default Settings;