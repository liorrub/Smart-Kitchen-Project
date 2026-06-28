import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getPendingRecipeCount } from "../services/recipeService";
import { getUserRole } from "../utils/authUtils";

const PendingRecipeContext = createContext({ pendingCount: 0, refreshCount: () => {} });

export function PendingRecipeProvider({ children }) {
    const { user } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const isAdmin = getUserRole(user) === "admin";

    async function fetchCount() {
        if (!user) return;
        try {
            const data = await getPendingRecipeCount(user);
            setPendingCount(typeof data?.count === "number" ? data.count : 0);
        } catch {
            // Don't break the app if this endpoint is unavailable
        }
    }

    useEffect(() => {
        if (isAdmin && user) {
            fetchCount();
        } else {
            setPendingCount(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, isAdmin]);

    return (
        <PendingRecipeContext.Provider value={{ pendingCount, refreshCount: fetchCount }}>
            {children}
        </PendingRecipeContext.Provider>
    );
}

export function usePendingRecipes() {
    return useContext(PendingRecipeContext);
}
