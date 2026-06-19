import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// Provide the logged-in user to the whole app.
// Initializes from sessionStorage (tab-local) so each tab keeps its own identity on refresh.
export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(sessionStorage.getItem("user") ?? "null")
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