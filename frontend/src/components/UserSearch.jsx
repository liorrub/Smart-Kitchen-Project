import "./UserSearch.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { searchUsers } from "../services/profileService";
import AvatarImage from "./AvatarImage";
import { getRoleLabel } from "../utils/roleLabels";

const DEBOUNCE_MS = 300;

// Navbar overlay for global user search.
// Renders an input that searches by username/name and shows a floating result list.
// Props:
//   onClose() — called when the overlay should close (user pressed Escape or clicked outside)
function UserSearch({ onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const timerRef = useRef(null);
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const navigate = useNavigate();

    // Auto-focus input when the overlay opens
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                onClose?.();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose?.();
        }
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    const doSearch = useCallback(async (q) => {
        if (!q.trim()) {
            setResults([]);
            setError("");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const data = await searchUsers(q.trim(), "all");
            setResults(Array.isArray(data) ? data : []);
        } catch {
            setError("Search failed. Please try again.");
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleChange(e) {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => doSearch(val), DEBOUNCE_MS);
    }

    function handleSelectUser(userId) {
        navigate(`/profile/${userId}`);
        onClose?.();
    }

    const showResults = query.trim().length > 0;

    return (
        <div className="user-search-overlay" ref={containerRef} role="search">
            <input
                ref={inputRef}
                type="text"
                className="user-search-input"
                placeholder="Search by @username or name…"
                value={query}
                onChange={handleChange}
                aria-label="Search users"
            />

            {showResults && (
                <div className="user-search-results" role="listbox">
                    {loading && (
                        <p className="user-search-status">Searching…</p>
                    )}

                    {!loading && error && (
                        <p className="user-search-status user-search-error">{error}</p>
                    )}

                    {!loading && !error && results.length === 0 && (
                        <p className="user-search-status">No users found for "{query}"</p>
                    )}

                    {!loading && results.map(user => (
                        <button
                            key={user.userId}
                            type="button"
                            className="user-search-result"
                            role="option"
                            aria-selected={false}
                            onClick={() => handleSelectUser(user.userId)}
                        >
                            <AvatarImage
                                avatarKey={user.avatarKey}
                                firstName={user.firstName}
                                lastName={user.lastName}
                                size="sm"
                            />
                            <div className="user-search-result-info">
                                <span className="user-search-result-name">
                                    {user.firstName} {user.lastName}
                                </span>
                                {user.username && (
                                    <span className="user-search-result-username">
                                        @{user.username}
                                    </span>
                                )}
                                <span className="user-search-result-meta">
                                    {getRoleLabel(user.userRole)} · {user.city}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserSearch;
