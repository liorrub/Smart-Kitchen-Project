import "./Profile.css";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import FollowButton from "../components/FollowButton";
import RecipeCard from "../components/RecipeCard";
import PageHero from "../components/PageHero";

import { getUserProfile, getFollowers, getFollowing } from "../services/followService";
import { getUserLikedRecipeIds } from "../services/likeService";
import { likeRecipe, unlikeRecipe } from "../services/likeService";
import { filterRecipes } from "../services/recipeService";
import { formatText } from "../utils/formatUtils";

// Roles whose profiles may show a Follow button to eligible viewers
const FOLLOWABLE_ROLES = ["chef", "influencer"];

// Roles that are allowed to follow others
const ALLOWED_FOLLOWER_ROLES = ["user", "chef", "influencer"];

function Profile() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile]             = useState(null);
    const [recipes, setRecipes]             = useState([]);
    const [followers, setFollowers]         = useState([]);
    const [following, setFollowing]         = useState([]);
    const [likedRecipeIds, setLikedRecipeIds] = useState(new Set());
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingRecipes, setLoadingRecipes] = useState(true);
    const [error, setError]                 = useState("");
    const [activeTab, setActiveTab]         = useState("recipes");
    const [followerCount, setFollowerCount] = useState(0);

    const profileUserId = Number(id);
    const isSelf        = currentUser?.userId === profileUserId;

    // Determine whether the Follow button should be shown.
    const canShowFollowButton =
        !isSelf &&
        profile &&
        FOLLOWABLE_ROLES.includes(profile.userRole) &&
        currentUser &&
        ALLOWED_FOLLOWER_ROLES.includes(currentUser.userRole);

    useEffect(() => {
        if (!currentUser) {
            navigate("/");
            return;
        }

        async function loadProfile() {
            setLoadingProfile(true);
            setError("");
            try {
                const data = await getUserProfile(profileUserId);
                setProfile(data);
                setFollowerCount(data.followerCount || 0);
            } catch (err) {
                setError("Could not load this profile.");
            } finally {
                setLoadingProfile(false);
            }
        }

        async function loadRecipes() {
            setLoadingRecipes(true);
            try {
                const data = await filterRecipes({ creatorId: profileUserId });
                setRecipes(Array.isArray(data) ? data : []);
            } catch {
                setRecipes([]);
            } finally {
                setLoadingRecipes(false);
            }
        }

        async function loadLikedIds() {
            try {
                const ids = await getUserLikedRecipeIds(currentUser.userId);
                setLikedRecipeIds(new Set(Array.isArray(ids) ? ids.map(Number) : []));
            } catch {
                // non-critical
            }
        }

        loadProfile();
        loadRecipes();
        loadLikedIds();
    }, [profileUserId, currentUser, navigate]);

    useEffect(() => {
        if (activeTab !== "followers" && activeTab !== "following") return;

        async function loadFollowLists() {
            try {
                if (activeTab === "followers") {
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

        loadFollowLists();
    }, [activeTab, profileUserId]);

    async function handleLikeClick(recipe) {
        const id = recipe.recipeId;
        const isCurrentlyLiked = likedRecipeIds.has(id);
        try {
            if (isCurrentlyLiked) {
                await unlikeRecipe(id);
                setLikedRecipeIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                setRecipes(prev => prev.map(r =>
                    r.recipeId === id ? { ...r, likeCount: Math.max(0, (r.likeCount || 0) - 1) } : r
                ));
            } else {
                await likeRecipe(id);
                setLikedRecipeIds(prev => new Set([...prev, id]));
                setRecipes(prev => prev.map(r =>
                    r.recipeId === id ? { ...r, likeCount: (r.likeCount || 0) + 1 } : r
                ));
            }
        } catch {
            // non-critical
        }
    }

    if (loadingProfile) {
        return (
            <div className="profile-loading">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="profile-error">
                <p>{error || "Profile not found."}</p>
                <button type="button" onClick={() => navigate(-1)}>Go back</button>
            </div>
        );
    }

    const roleLabel = formatText(profile.userRole);

    return (
        <div className="profile-page">
            <PageHero
                title={`${profile.firstName} ${profile.lastName}`}
                subtitle={roleLabel}
            />

            <div className="profile-container">
                {/* ── Profile header card ── */}
                <div className="profile-header-card">
                    <div className="profile-avatar">
                        <span className="profile-avatar-initials">
                            {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </span>
                    </div>

                    <div className="profile-info">
                        <h2 className="profile-name">
                            {profile.firstName} {profile.lastName}
                        </h2>

                        <span className={`profile-role-badge profile-role-badge--${profile.userRole}`}>
                            {roleLabel}
                        </span>

                        {profile.city && (
                            <p className="profile-city">📍 {profile.city}</p>
                        )}

                        {profile.cookingLevel && (
                            <p className="profile-cooking-level">
                                🍳 {formatText(profile.cookingLevel)} cook
                            </p>
                        )}
                    </div>

                    <div className="profile-stats">
                        <button
                            type="button"
                            className={activeTab === "followers" ? "profile-stat active" : "profile-stat"}
                            onClick={() => setActiveTab("followers")}
                        >
                            <strong>{followerCount}</strong>
                            <span>Followers</span>
                        </button>

                        <button
                            type="button"
                            className={activeTab === "following" ? "profile-stat active" : "profile-stat"}
                            onClick={() => setActiveTab("following")}
                        >
                            <strong>{profile.followingCount || 0}</strong>
                            <span>Following</span>
                        </button>

                        <button
                            type="button"
                            className={activeTab === "recipes" ? "profile-stat active" : "profile-stat"}
                            onClick={() => setActiveTab("recipes")}
                        >
                            <strong>{recipes.length}</strong>
                            <span>Recipes</span>
                        </button>
                    </div>

                    {canShowFollowButton && (
                        <div className="profile-follow-action">
                            <FollowButton
                                targetUserId={profileUserId}
                                initialIsFollowing={profile.isFollowedByMe}
                                onFollowChange={(delta) =>
                                    setFollowerCount(prev => prev + delta)
                                }
                            />
                        </div>
                    )}
                </div>

                {/* ── Tab content ── */}
                <div className="profile-tabs">
                    <button
                        type="button"
                        className={activeTab === "recipes" ? "profile-tab active" : "profile-tab"}
                        onClick={() => setActiveTab("recipes")}
                    >
                        Recipes
                    </button>

                    <button
                        type="button"
                        className={activeTab === "followers" ? "profile-tab active" : "profile-tab"}
                        onClick={() => setActiveTab("followers")}
                    >
                        Followers ({followerCount})
                    </button>

                    <button
                        type="button"
                        className={activeTab === "following" ? "profile-tab active" : "profile-tab"}
                        onClick={() => setActiveTab("following")}
                    >
                        Following ({profile.followingCount || 0})
                    </button>
                </div>

                {/* Recipes tab */}
                {activeTab === "recipes" && (
                    <div className="profile-recipes-section">
                        {loadingRecipes ? (
                            <p className="profile-empty">Loading recipes...</p>
                        ) : recipes.length === 0 ? (
                            <p className="profile-empty">No recipes yet.</p>
                        ) : (
                            <div className="profile-recipes-grid">
                                {recipes.map(recipe => (
                                    <RecipeCard
                                        key={recipe.recipeId}
                                        recipe={recipe}
                                        showLikeButton
                                        isLiked={likedRecipeIds.has(recipe.recipeId)}
                                        likeCount={recipe.likeCount || 0}
                                        onLikeClick={handleLikeClick}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Followers tab */}
                {activeTab === "followers" && (
                    <div className="profile-user-list">
                        {followers.length === 0 ? (
                            <p className="profile-empty">No followers yet.</p>
                        ) : (
                            followers.map(f => (
                                <Link
                                    key={f.followId}
                                    to={`/profile/${f.followerId}`}
                                    className="profile-user-row"
                                >
                                    <span className="profile-user-avatar">
                                        {f.follower?.firstName?.[0]}{f.follower?.lastName?.[0]}
                                    </span>
                                    <span className="profile-user-name">
                                        {f.follower?.firstName} {f.follower?.lastName}
                                    </span>
                                    <span className={`profile-role-pill profile-role-pill--${f.follower?.userRole}`}>
                                        {formatText(f.follower?.userRole)}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {/* Following tab */}
                {activeTab === "following" && (
                    <div className="profile-user-list">
                        {following.length === 0 ? (
                            <p className="profile-empty">Not following anyone yet.</p>
                        ) : (
                            following.map(f => (
                                <Link
                                    key={f.followId}
                                    to={`/profile/${f.followeeId}`}
                                    className="profile-user-row"
                                >
                                    <span className="profile-user-avatar">
                                        {f.followee?.firstName?.[0]}{f.followee?.lastName?.[0]}
                                    </span>
                                    <span className="profile-user-name">
                                        {f.followee?.firstName} {f.followee?.lastName}
                                    </span>
                                    <span className={`profile-role-pill profile-role-pill--${f.followee?.userRole}`}>
                                        {formatText(f.followee?.userRole)}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
