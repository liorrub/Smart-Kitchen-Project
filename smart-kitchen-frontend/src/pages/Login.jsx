import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { validateLogin } from "../validators/loginValidator";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const { setUser } = useAuth();

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        const validationError = validateLogin(email, password);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const result = await login(email, password);

            setUser(result.data);

            localStorage.setItem(
                "user",
                JSON.stringify(result.data)
            );

            navigate("/dashboard");
        }
        catch (error) {
            console.error(error);

            setError(
                "Login failed. Please check your credentials."
            );
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Smart Kitchen Login</h1>

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                    />
                </div>

                <div>
                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                {loading && (
                    <p>Loading...</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Logging in..."
                        : "Login"}
                </button>
            </form>
        </div>
    );
}

export default Login;