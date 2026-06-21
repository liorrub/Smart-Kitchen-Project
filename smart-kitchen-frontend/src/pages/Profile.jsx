import "./Profile.css";

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import PageHero from "../components/PageHero";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";
import FollowButton from "../components/FollowButton";
import AvatarImage from "../components/AvatarImage";

import { getUserProfile } from "../services/profileService";
import { getFollowers, getFollowing } from "../services/followService";
import { getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";
import { formatText } from "../utils/formatUtils";
import { getRoleLabel } from "../utils/roleLabels";


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

// Roles whose profiles show a Follow button to eligible viewers
const FOLLOWABLE_ROLES = ["chef", "influencer"];

// Roles that are allowed to follow others
const ALLOWED_FOLLOWER_ROLES = ["user", "chef", "influencer"];

function getRoleBadgeClass(role) {
    return ROLE_COLORS[role] || "profile-badge-user";
}

function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile]         = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");
    const [followerCount, setFollowerCount] = useState(0);
    const [socialTab, setSocialTab]     = useState(null);
    const [followers, setFollowers]     = useState([]);
    const [following, setFollowing]     = useState([]);

    const currentUser = getStoredUser();
    const profileUserId = Number(id);
    const isOwnProfile = currentUser?.userId === profileUserId;

    const canShowFollowButton =
        !isOwnProfile &&
        profile &&
        FOLLOWABLE_ROLES.includes(profile.userRole) &&
        currentUser &&
        ALLOWED_FOLLOWER_ROLES.includes(currentUser.userRole);

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setError("");
                const data = await getUserProfile(id);
                setProfile(data);
                setFollowerCount(data.followerCount || 0);
            } catch (err) {
                setError(getErrorMessage(err, "Failed to load profile."));
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [id]);

    useEffect(() => {
        if (!socialTab) return;

        async function loadList() {
            try {
                if (socialTab === "followers") {
                    const data = await getFollowers(profileUserId);
                    setFollowers(Array.isArray(data) ? data : []);
                } else {
                    const data = await getFollowing(profileUserId);
                    setFollowing(Array.isArray(data) ? data : []);
                }
            } catch {
                // non-critical
            }
        }

        loadList();
    }, [socialTab, profileUserId]);

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
        { value: followerCount, label: "Followers" },
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
                    <AvatarImage
                        avatarKey={profile.avatarKey}
                        firstName={profile.firstName}
                        lastName={profile.lastName}
                        size="xl"
                        className="profile-avatar"
                    />

                    <div className="profile-identity-info">
                        <div className="profile-name-row">
                            <h2>{profile.firstName} {profile.lastName}</h2>
                            {profile.username && (
                                <span className="profile-username">@{profile.username}</span>
                            )}
                        </div>

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
                        {canShowFollowButton && (
                            <FollowButton
                                targetUserId={profileUserId}
                                initialIsFollowing={profile.isFollowedByMe}
                                onFollowChange={(delta) =>
                                    setFollowerCount(prev => prev + delta)
                                }
                            />
                        )}

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

                    <button
                        type="button"
                        className={socialTab === "followers" ? "profile-stat profile-stat--clickable active" : "profile-stat profile-stat--clickable"}
                        onClick={() => setSocialTab(prev => prev === "followers" ? null : "followers")}
                    >
                        <strong>{followerCount}</strong>
                        <span>Followers</span>
                    </button>

                    <button
                        type="button"
                        className={socialTab === "following" ? "profile-stat profile-stat--clickable active" : "profile-stat profile-stat--clickable"}
                        onClick={() => setSocialTab(prev => prev === "following" ? null : "following")}
                    >
                        <strong>{profile.followingCount || 0}</strong>
                        <span>Following</span>
                    </button>

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

            {/* Followers / Following panel — shown when a stat is clicked */}
            {socialTab && (
                <section className="profile-social-section">
                    <div className="profile-section-header">
                        <h3>{socialTab === "followers" ? "Followers" : "Following"}</h3>
                        <button
                            type="button"
                            className="profile-back-btn"
                            onClick={() => setSocialTab(null)}
                        >
                            Close
                        </button>
                    </div>

                    <div className="profile-user-list">
                        {socialTab === "followers" ? (
                            followers.length === 0 ? (
                                <p className="profile-empty-section">No followers yet.</p>
                            ) : (
                                followers.map(f => (
                                    <Link
                                        key={f.followId}
                                        to={`/profile/${f.followerId}`}
                                        className="profile-user-row"
                                    >
                                        <AvatarImage
                                            avatarKey={f.follower?.avatarKey}
                                            firstName={f.follower?.firstName}
                                            lastName={f.follower?.lastName}
                                            size="sm"
                                            className="profile-user-avatar"
                                        />
                                        <span className="profile-user-name">
                                            {f.follower?.firstName} {f.follower?.lastName}
                                            {f.follower?.username && (
                                                <small className="profile-username-inline"> @{f.follower.username}</small>
                                            )}
                                        </span>
                                        <span className={`profile-badge ${getRoleBadgeClass(f.follower?.userRole)}`}>
                                            {getRoleLabel(f.follower?.userRole)}
                                        </span>
                                    </Link>
                                ))
                            )
                        ) : (
                            following.length === 0 ? (
                                <p className="profile-empty-section">Not following anyone yet.</p>
                            ) : (
                                following.map(f => (
                                    <Link
                                        key={f.followId}
                                        to={`/profile/${f.followeeId}`}
                                        className="profile-user-row"
                                    >
                                        <AvatarImage
                                            avatarKey={f.followee?.avatarKey}
                                            firstName={f.followee?.firstName}
                                            lastName={f.followee?.lastName}
                                            size="sm"
                                            className="profile-user-avatar"
                                        />
                                        <span className="profile-user-name">
                                            {f.followee?.firstName} {f.followee?.lastName}
                                            {f.followee?.username && (
                                                <small className="profile-username-inline"> @{f.followee.username}</small>
                                            )}
                                        </span>
                                        <span className={`profile-badge ${getRoleBadgeClass(f.followee?.userRole)}`}>
                                            {getRoleLabel(f.followee?.userRole)}
                                        </span>
                                    </Link>
                                ))
                            )
                        )}
                    </div>
                </section>
            )}

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
