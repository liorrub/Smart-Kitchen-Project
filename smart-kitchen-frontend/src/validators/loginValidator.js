export function validateLogin(email, password) {

    if (!email.trim()) {
        return "Email is required";
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
        return "Please enter a valid email";
    }

    if (!password.trim()) {
        return "Password is required";
    }

    if (password.length < 6) {
        return "Password must contain at least 6 characters";
    }

    return null;
}