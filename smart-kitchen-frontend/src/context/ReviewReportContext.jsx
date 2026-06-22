import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getOpenReviewReportCount } from "../services/reviewsService";
import { getUserRole } from "../utils/authUtils";

const ReviewReportContext = createContext({ openCount: 0, refreshCount: () => {} });

export function ReviewReportProvider({ children }) {
    const { user } = useAuth();
    const [openCount, setOpenCount] = useState(0);
    const isAdmin = getUserRole(user) === "admin";

    async function fetchCount() {
        if (!user) return;
        try {
            const data = await getOpenReviewReportCount();
            setOpenCount(typeof data?.count === "number" ? data.count : 0);
        } catch {
            // Don't break the app if this endpoint is unavailable
        }
    }

    useEffect(() => {
        if (isAdmin && user) {
            fetchCount();
        } else {
            setOpenCount(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId, isAdmin]);

    return (
        <ReviewReportContext.Provider value={{ openCount, refreshCount: fetchCount }}>
            {children}
        </ReviewReportContext.Provider>
    );
}

export function useReviewReports() {
    return useContext(ReviewReportContext);
}
