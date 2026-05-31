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

    if (
        !/^[a-zA-Z\s]+$/.test(formData.firstName)
    ) {
        return "First name must contain letters only";
    }

    if (
        !/^[a-zA-Z\s]+$/.test(formData.lastName)
    ) {
        return "Last name must contain letters only";
    }

    if (
        isNaN(formData.age) ||
        Number(formData.age) < 1 ||
        Number(formData.age) > 120
    ) {
        return "Age must be between 1 and 120";
    }

    return null;
}