import "./Profile.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHero from "../components/PageHero";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";

import { getUserProfile } from "../services/profileService";
import { getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";
import { formatText } from "../utils/formatUtils";

const ROLE_LABELS = {
    chef: "Chef",
    influencer: "Influencer",
    admin: "Admin",
    user: "Member"
};

const ROLE_COLORS = {
    chef: "profile-badge-chef",
    influencer: "profile-badge-influencer",
    admin: "profile-badge-admin",
    user: "profile-badge-user"
};

const LEVEL_ICONS = {
    beginner: "🌱",
    intermediate: "🍳",
    advanced: "⭐"
};

function getRoleLabel(role) {
    return ROLE_LABELS[role] || role;
}

function getRoleBadgeClass(role) {
    return ROLE_COLORS[role] || "profile-badge-user";
}

function getInitials(firstName, lastName) {
    return `${(firstName || "?")[0]}${(lastName || "?")[0]}`.toUpperCase();
}

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currentUser = getStoredUser();
    const isOwnProfile = currentUser?.userId === Number(id);

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setError("");
                const data = await getUserProfile(id);
                setProfile(data);
            } catch (err) {
                setError(getErrorMessage(err, "Failed to load profile."));
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading-card">
                    <h2>Loading profile...</h2>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="profile-page">
                <div className="profile-loading-card">
                    <h2>Profile not found</h2>
                    <p>{error || "This user does not exist."}</p>
                    <button
                        type="button"
                        className="profile-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const isChef = profile.userRole === "chef";
    const isInfluencer = profile.userRole === "influencer";
    const showRecipes = isChef && profile.recentRecipes?.length > 0;

    const heroStats = [
        { value: profile.recipeCount, label: "Recipes" },
        { value: profile.followerCount, label: "Followers" },
        ...(isChef
            ? [{ value: profile.avgRating ?? "–", label: "Avg rating" }]
            : []),
        ...(isInfluencer
            ? [{ value: profile.reviewCount, label: "Reviews" },
               { value: profile.totalHelpfulVotes, label: "Helpful votes" }]
            : [])
    ];

    return (
        <div className="profile-page">
            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />

            <PageHero
                label={isOwnProfile ? "Your Profile" : "User Profile"}
                title={`${profile.firstName} ${profile.lastName}`}
                description={`${formatText(profile.cookingLevel)} cook from ${profile.city}`}
                stats={heroStats}
            />

            {/* Profile identity card */}
            <section className="profile-card">
                <div className="profile-identity">
                    <div className="profile-avatar">
                        {getInitials(profile.firstName, profile.lastName)}
                    </div>

                    <div className="profile-identity-info">
                        <h2>{profile.firstName} {profile.lastName}</h2>

                        <div className="profile-badges">
                            <span className={`profile-badge ${getRoleBadgeClass(profile.userRole)}`}>
                                {getRoleLabel(profile.userRole)}
                            </span>

                            <span className="profile-level-badge">
                                {LEVEL_ICONS[profile.cookingLevel]} {formatText(profile.cookingLevel)}
                            </span>
                        </div>

                        <p className="profile-city">📍 {profile.city}</p>
                    </div>

                    <div className="profile-action-area">
                        {/* Follow button will be added in Feature 3 */}
                        {isOwnProfile && (
                            <button
                                type="button"
                                className="profile-edit-btn"
                                onClick={() => navigate("/settings")}
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats grid — visible fields depend on role */}
                <div className="profile-stats-grid">
                    <div className="profile-stat">
                        <strong>{profile.recipeCount}</strong>
                        <span>Recipes</span>
                    </div>

                    <div className="profile-stat">
                        <strong>{profile.followerCount}</strong>
                        <span>Followers</span>
                    </div>

                    {isChef && (
                        <>
                            <div className="profile-stat">
                                <strong>{profile.avgRating ?? "–"}</strong>
                                <span>Avg Rating</span>
                            </div>

                            <div className="profile-stat">
                                <strong>{profile.totalRatings}</strong>
                                <span>Total Ratings</span>
                            </div>
                        </>
                    )}

                    {isInfluencer && (
                        <>
                            <div className="profile-stat">
                                <strong>{profile.reviewCount}</strong>
                                <span>Reviews Written</span>
                            </div>

                            <div className="profile-stat">
                                <strong>{profile.totalHelpfulVotes}</strong>
                                <span>Helpful Votes</span>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Recent recipes (chefs only) */}
            {showRecipes && (
                <section className="profile-recipes-section">
                    <div className="profile-section-header">
                        <h3>Recent Recipes</h3>
                        <span>{profile.recipeCount} total</span>
                    </div>

                    <div className="profile-recipes-grid">
                        {profile.recentRecipes.map(recipe => (
                            <RecipeCard
                                key={recipe.recipeId}
                                recipe={recipe}
                                onClick={setSelectedRecipe}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty state for non-chefs with no recipes */}
            {!showRecipes && profile.recipeCount === 0 && (
                <section className="profile-empty-section">
                    <p>No recipes yet.</p>
                </section>
            )}
        </div>
    );
}

export default Profile;
