import "./Discover.css";

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import PageHero from "../components/PageHero";

import { getDiscoverCreators } from "../services/discoverService";
import { getErrorMessage } from "../utils/apiUtils";

const ROLE_LABELS = {
    chef: "Chef",
    influencer: "Influencer"
};

const ROLE_BADGE_CLASSES = {
    chef: "profile-badge-chef",
    influencer: "profile-badge-influencer"
};

const FILTER_OPTIONS = [
    { value: "all", label: "All Creators" },
    { value: "chef", label: "Chefs" },
    { value: "influencer", label: "Influencers" }
];

function getInitials(firstName, lastName) {
    return `${(firstName || "?")[0]}${(lastName || "?")[0]}`.toUpperCase();
}

function DiscoverCard({ creator }) {
    const isChef = creator.userRole === "chef";
    const isInfluencer = creator.userRole === "influencer";

    return (
        <div className="discover-card">
            <div className="discover-card-avatar">
                {getInitials(creator.firstName, creator.lastName)}
            </div>

            <div className="discover-card-body">
                <h3 className="discover-card-name">
                    {creator.firstName} {creator.lastName}
                </h3>

                <div className="discover-card-badges">
                    <span className={`profile-badge ${ROLE_BADGE_CLASSES[creator.userRole] || ""}`}>
                        {ROLE_LABELS[creator.userRole] || creator.userRole}
                    </span>
                </div>

                {creator.city && (
                    <p className="discover-card-city">📍 {creator.city}</p>
                )}

                <div className="discover-card-stats">
                    <div className="discover-stat">
                        <strong>{creator.recipeCount}</strong>
                        <span>Recipes</span>
                    </div>

                    {isChef && (
                        <div className="discover-stat">
                            <strong>{creator.avgRating ?? "–"}</strong>
                            <span>Avg Rating</span>
                        </div>
                    )}

                    {isInfluencer && (
                        <div className="discover-stat">
                            <strong>{creator.reviewCount}</strong>
                            <span>Reviews</span>
                        </div>
                    )}

                    <div className="discover-stat">
                        <strong>{creator.followerCount}</strong>
                        <span>Followers</span>
                    </div>
                </div>
            </div>

            <NavLink
                to={`/profile/${creator.userId}`}
                className="discover-card-btn"
            >
                View Profile
            </NavLink>
        </div>
    );
}

function Discover() {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");
                const data = await getDiscoverCreators();
                setCreators(data);
            } catch (err) {
                setError(getErrorMessage(err, "Failed to load creators."));
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return creators.filter(c => {
            if (filter !== "all" && c.userRole !== filter) return false;
            if (!q) return true;
            return (
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                (c.city || "").toLowerCase().includes(q)
            );
        });
    }, [creators, filter, search]);

    const totalChefs = creators.filter(c => c.userRole === "chef").length;
    const totalInfluencers = creators.filter(c => c.userRole === "influencer").length;

    return (
        <div className="discover-page">
            <PageHero
                label="Social"
                title="Discover Creators"
                description="Find chefs and influencers in the Smart Kitchen community"
                stats={[
                    { value: creators.length, label: "Creators" },
                    { value: totalChefs, label: "Chefs" },
                    { value: totalInfluencers, label: "Influencers" }
                ]}
            />

            {/* Filter bar */}
            <div className="discover-filter-bar">
                <div className="discover-filter-tabs">
                    {FILTER_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            className={`discover-tab${filter === opt.value ? " active" : ""}`}
                            onClick={() => setFilter(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    className="discover-search"
                    placeholder="Search by name or city..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Content */}
            {loading && (
                <div className="discover-status">
                    <p>Loading creators...</p>
                </div>
            )}

            {!loading && error && (
                <div className="discover-status discover-error">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="discover-status">
                    <p>No creators found{search ? ` for "${search}"` : ""}.</p>
                </div>
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="discover-grid">
                    {filtered.map(creator => (
                        <DiscoverCard key={creator.userId} creator={creator} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Discover;
