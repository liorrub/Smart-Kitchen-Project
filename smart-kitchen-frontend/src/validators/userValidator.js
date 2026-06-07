const roles = [
    "user",
    "chef",
    "influencer",
    "admin"
];

const cookingLevels = [
    "beginner",
    "intermediate",
    "advanced"
];

function isEmpty(value) {
    return (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    );
}

function isValidEmail(email) {
    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email);
}

function isValidName(value) {
    const nameRegex =
        /^[A-Za-zא-ת\s-]+$/;

    const text = value.trim();

    return (
        text.length >= 2 &&
        nameRegex.test(text)
    );
}

function isValidAge(age) {
    const numericAge = Number(age);

    return (
        Number.isInteger(numericAge) &&
        numericAge >= 1 &&
        numericAge <= 120
    );
}

export function validateLogin(email, password) {
    if (isEmpty(email)) {
        return "Email is required";
    }

    if (!isValidEmail(email.trim())) {
        return "Please enter a valid email";
    }

    if (isEmpty(password)) {
        return "Password is required";
    }

    if (password.length < 6) {
        return "Password must contain at least 6 characters";
    }

    return null;
}

export function validateRegisterForm(formData) {
    if (isEmpty(formData.firstName)) {
        return "First name is required";
    }

    if (!isValidName(formData.firstName)) {
        return "First name must contain only letters, spaces or hyphen, and be at least 2 characters long";
    }

    if (isEmpty(formData.lastName)) {
        return "Last name is required";
    }

    if (!isValidName(formData.lastName)) {
        return "Last name must contain only letters, spaces or hyphen, and be at least 2 characters long";
    }

    if (isEmpty(formData.email)) {
        return "Email is required";
    }

    if (!isValidEmail(formData.email.trim())) {
        return "Please enter a valid email address";
    }

    if (isEmpty(formData.password)) {
        return "Password is required";
    }

    if (formData.password.length < 6) {
        return "Password must be at least 6 characters";
    }

    if (isEmpty(formData.city)) {
        return "City is required";
    }

    if (!isValidName(formData.city)) {
        return "City must contain only letters, spaces or hyphen, and be at least 2 characters long";
    }

    if (isEmpty(formData.age)) {
        return "Age is required";
    }

    if (!isValidAge(formData.age)) {
        return "Age must be between 1 and 120";
    }

    if (
        formData.cookingLevel &&
        !cookingLevels.includes(formData.cookingLevel)
    ) {
        return "Invalid cooking level";
    }

    return null;
}

export function validateUserManagementForm(userData, isNewUser = false) {
    if (isEmpty(userData.firstName)) {
        return "First name is required";
    }

    if (!isValidName(userData.firstName)) {
        return "First name must contain only letters, spaces or hyphen, and be at least 2 characters long";
    }

    if (isEmpty(userData.lastName)) {
        return "Last name is required";
    }

    if (!isValidName(userData.lastName)) {
        return "Last name must contain only letters, spaces or hyphen, and be at least 2 characters long";
    }

    if (isEmpty(userData.email)) {
        return "Email is required";
    }

    if (!isValidEmail(userData.email.trim())) {
        return "Please enter a valid email address";
    }

    if (isEmpty(userData.city)) {
        return "City is required";
    }

    if (!isValidName(userData.city)) {
        return "City must contain only letters, spaces or hyphen, and be at least 2 characters long";
    }

    if (isEmpty(userData.userRole)) {
        return "User role is required";
    }

    if (!roles.includes(userData.userRole)) {
        return "Invalid user role";
    }

    if (isEmpty(userData.cookingLevel)) {
        return "Cooking level is required";
    }

    if (!cookingLevels.includes(userData.cookingLevel)) {
        return "Invalid cooking level";
    }

    if (!isEmpty(userData.age) && !isValidAge(userData.age)) {
        return "Age must be between 1 and 120";
    }

    if (isNewUser) {
        if (isEmpty(userData.password)) {
            return "Password is required";
        }

        if (userData.password.length < 6) {
            return "Password must be at least 6 characters";
        }
    }

    return null;
}