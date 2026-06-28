// Hebrew characters (א-ת) are allowed because some users have Hebrew names.
const NAME_REGEX = /^[A-Za-zא-ת\s-]+$/;

function isValidUsername(username) {
    if (!username || typeof username !== "string") return false;
    const u = username.trim().toLowerCase();
    if (u.length < 3 || u.length > 30) return false;
    if (!/^[a-z]/.test(u)) return false;
    if (/[_.]$/.test(u)) return false;
    if (!/^[a-z0-9_.]+$/.test(u)) return false;
    if (/[_.]{2}/.test(u)) return false;
    return true;
}

// Validate the settings profile form. Returns an error message string or null if valid.
export function validateSettings(formData) {

    if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email
    ) {
        return "Please fill all required fields";
    }

    if (
        formData.age === "" ||
        formData.age === null
    ) {
        return "Age is required";
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(formData.email)) {
        return "Please enter a valid email address";
    }

    if (!NAME_REGEX.test(formData.firstName.trim())) {
        return "First name must contain letters only";
    }

    if (!NAME_REGEX.test(formData.lastName.trim())) {
        return "Last name must contain letters only";
    }

    if (
        isNaN(formData.age) ||
        Number(formData.age) < 1 ||
        Number(formData.age) > 120
    ) {
        return "Age must be between 1 and 120";
    }

    if (!formData.city || !formData.city.trim()) {
        return "City is required";
    }

    if (!formData.username || !formData.username.trim()) {
        return "Username is required";
    }

    if (!isValidUsername(formData.username)) {
        return "Username must be 3–30 characters, start with a letter, and contain only letters, numbers, underscores, or periods";
    }

    return null;
}
