import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Provide the logged-in user to the whole app.
// Initializes from localStorage so the session survives a page refresh.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}