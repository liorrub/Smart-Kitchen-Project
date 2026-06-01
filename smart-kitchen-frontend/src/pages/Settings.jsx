import { useEffect, useState } from "react";
import { validateSettings } from "../validators/settingsValidator";
import { getSettings, updateSettings } from "../services/settingsService";

function Settings() {
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        cookingLevel: "",
        age: "",
        theme: "light"
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadSettings() {
            try {
                const storedUser = JSON.parse(
                    localStorage.getItem("user")
                );

                if (!storedUser) {
                    return;
                }

                const response = await getSettings();

                const currentUser = response.data;

                const savedTheme =
                    localStorage.getItem("theme") ||
                    "light";

                setUser(currentUser);

                setFormData({
                    firstName: currentUser.firstName || "",
                    lastName: currentUser.lastName || "",
                    email: currentUser.email || "",
                    cookingLevel:
                        currentUser.cookingLevel || "",
                    age: currentUser.age || "",
                    theme: savedTheme
                });

            } catch (err) {
                console.error(err);

                setError(
                    "Failed to load settings"
                );
            }
        }

        loadSettings();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSuccess("");
        setError("");

        const validationError =
            validateSettings(formData);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            await updateSettings({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                cookingLevel: formData.cookingLevel,
                age: Number(formData.age)
            });

            localStorage.setItem(
                "theme",
                formData.theme
            );

            setSuccess(
                "Settings saved successfully"
            );

        } catch (err) {
            console.error(err);

            setError(
                "Failed to save settings"
            );
        } finally {
            setLoading(false);
        }
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div>
                <h1>Settings</h1>

                {success && (
                    <p>{success}</p>
                )}

                {error && (
                    <p>{error}</p>
                )}

                <form
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div>
                        <label>
                            First Name
                        </label>

                        <input
                            type="text"
                            name="firstName"
                            value={
                                formData.firstName
                            }
                            onChange={
                                handleChange
                            }
                        />
                    </div>

                    <div>
                        <label>
                            Last Name
                        </label>

                        <input
                            type="text"
                            name="lastName"
                            value={
                                formData.lastName
                            }
                            onChange={
                                handleChange
                            }
                        />
                    </div>

                    <div>
                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                        />
                    </div>

                    <div>
                        <label>
                            Cooking Level
                        </label>

                        <select
                            name="cookingLevel"
                            value={
                                formData.cookingLevel
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option value="beginner">
                                Beginner
                            </option>

                            <option value="intermediate">
                                Intermediate
                            </option>

                            <option value="advanced">
                                Advanced
                            </option>
                        </select>
                    </div>

                    <div>
                        <label>
                            Age
                        </label>

                        <input
                            type="number"
                            name="age"
                            min="1"
                            max="120"
                            value={
                                formData.age
                            }
                            onChange={
                                handleChange
                            }
                        />
                    </div>

                    <div>
                        <label>
                            Theme
                        </label>

                        <select
                            name="theme"
                            value={
                                formData.theme
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option value="light">
                                Light
                            </option>

                            <option value="dark">
                                Dark
                            </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : "Save Settings"}
                    </button>
                </form>
            </div>
        </>
    );
}

export default Settings;