import "./Settings.css";

import { useEffect, useState } from "react";

import PageErrorState from "../components/PageErrorState";
import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";
import CheckboxGroup, { formatCheckboxLabel } from "../components/CheckboxGroup";

import { useAuth } from "../context/AuthContext";
import { validateSettings } from "../validators/settingsValidator";
import AvatarImage from "../components/AvatarImage";
import AvatarPicker from "../components/AvatarPicker";
import { AVATAR_DEFAULT } from "../utils/avatarCatalog";
import {
    changePassword,
    getSettings,
    updateSettings
} from "../services/settingsService";
import { getMyChefRequest, submitChefRequest } from "../services/chefRequestService";
import { CITY_OPTIONS, COOKING_LEVEL_OPTIONS } from "../constants/options";
import CityPicker from "../components/CityPicker";

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
        city: "",
        age: "",
        cookingLevel: "beginner",
        preferences: {
            dietary: [],
            cuisine: []
        },
        username: "",
        avatarKey: AVATAR_DEFAULT
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Chef request state
    const [chefRequest, setChefRequest] = useState(null);
    const [requestReason, setRequestReason] = useState("");
    const [submittingRequest, setSubmittingRequest] = useState(false);

    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    // Message states
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [passwordError, setPasswordError] = useState("");

    // Derived values
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
                    city: data.city || "",
                    age: data.age || "",
                    cookingLevel: data.cookingLevel || "beginner",
                    preferences: {
                        dietary: data.preferences?.dietary || [],
                        cuisine: data.preferences?.cuisine || []
                    },
                    username: data.username || "",
                    avatarKey: data.avatarKey || AVATAR_DEFAULT
                });

                if (["user", "influencer"].includes(data.userRole)) {
                    try {
                        const myRequest = await getMyChefRequest();
                        setChefRequest(myRequest);
                    } catch (requestErr) {
                        console.error(requestErr);
                    }
                }
            } catch (err) {
                console.error(err);

                setLoadError(
                    !err.response
                        ? "Unable to connect to the server. Please try again in a few moments."
                        : "Failed to load settings."
                );
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    // Submits a chef account request
    async function handleSubmitChefRequest(event) {
        event.preventDefault();
        setSuccess("");
        setError("");

        if (!requestReason.trim()) {
            setError("Please provide a reason for your request.");
            return;
        }

        try {
            setSubmittingRequest(true);
            const newRequest = await submitChefRequest(requestReason.trim());
            setChefRequest(newRequest);
            setRequestReason("");
            setSuccess("Your chef request has been submitted successfully.");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.error?.message ||
                "Failed to submit chef request."
            );
        } finally {
            setSubmittingRequest(false);
        }
    }

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
                city: formData.city.trim(),
                age: Number(formData.age),
                cookingLevel: formData.cookingLevel,
                preferences: formData.preferences,
                username: formData.username.trim().toLowerCase(),
                avatarKey: formData.avatarKey
            });

            sessionStorage.setItem(
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

    if (loadError) {
        return (
            <div className="settings-page">
                <PageErrorState
                    title="Settings Error"
                    message={loadError}
                    onRetry={() => window.location.reload()}
                />
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
                        <AvatarImage
                            avatarKey={formData.avatarKey}
                            firstName={formData.firstName}
                            lastName={formData.lastName}
                            size="lg"
                            className="summary-avatar"
                        />

                        <div>
                            <span>Current Profile</span>

                            <strong>
                                {formData.firstName} {formData.lastName}
                            </strong>

                            {formData.username && (
                                <p className="settings-username-display">@{formData.username}</p>
                            )}

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

                        <CityPicker
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            cities={CITY_OPTIONS}
                            placeholder="Search or select city..."
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
                            options={COOKING_LEVEL_OPTIONS}
                            onChange={handleChange}
                        />

                        <FormField
                            label="Username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="e.g. lior_99"
                        />
                    </div>

                    <AvatarPicker
                        value={formData.avatarKey}
                        onChange={(key) =>
                            setFormData(prev => ({ ...prev, avatarKey: key }))
                        }
                        firstName={formData.firstName}
                        lastName={formData.lastName}
                    />

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

            {/* Chef Account Request Card — visible to regular users and influencers only */}
            {(user?.userRole === "user" || user?.userRole === "influencer") && (
                <section className="settings-card">
                    <div className="settings-card-header">
                        <h2>Chef Account Request</h2>
                        <p>Request to become a chef and start publishing your own recipes.</p>
                    </div>

                    {!chefRequest && (
                        <form className="settings-form" onSubmit={handleSubmitChefRequest} noValidate>
                            <div className="settings-grid">
                                <FormField
                                    label="Why do you want to become a chef?"
                                    type="text"
                                    name="requestReason"
                                    value={requestReason}
                                    onChange={(e) => setRequestReason(e.target.value)}
                                    placeholder="Tell us a little about yourself and your cooking..."
                                />
                            </div>

                            <div className="settings-actions">
                                <AppButton type="submit" disabled={submittingRequest}>
                                    {submittingRequest ? "Submitting..." : "Submit Request"}
                                </AppButton>
                            </div>
                        </form>
                    )}

                    {chefRequest?.status === "pending" && (
                        <p className="settings-info-text">
                            Your request is pending review. We will notify you once an admin has reviewed it.
                        </p>
                    )}

                    {chefRequest?.status === "approved" && (
                        <p className="settings-info-text">
                            Your chef request was approved! Please log out and log back in to access chef features.
                        </p>
                    )}

                    {chefRequest?.status === "rejected" && (
                        <>
                            <p className="settings-info-text">
                                Your previous request was not approved. You may submit a new request below.
                            </p>

                            <form className="settings-form" onSubmit={handleSubmitChefRequest} noValidate>
                                <div className="settings-grid">
                                    <FormField
                                        label="Why do you want to become a chef?"
                                        type="text"
                                        name="requestReason"
                                        value={requestReason}
                                        onChange={(e) => setRequestReason(e.target.value)}
                                        placeholder="Tell us a little about yourself and your cooking..."
                                    />
                                </div>

                                <div className="settings-actions">
                                    <AppButton type="submit" disabled={submittingRequest}>
                                        {submittingRequest ? "Submitting..." : "Submit New Request"}
                                    </AppButton>
                                </div>
                            </form>
                        </>
                    )}
                </section>
            )}

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