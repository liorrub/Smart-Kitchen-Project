import "./Feed.css";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import RecipeDetailsModal from "../components/RecipeDetailsModal";
import FollowButton from "../components/FollowButton";

import { getFeed, getFollowing } from "../services/followService";
import { getDiscoverCreators } from "../services/discoverService";
import { getUserLikedRecipeIds, likeRecipe, unlikeRecipe } from "../services/likeService";
import { getUserFavorites, addFavorite, removeFavorite } from "../services/favoritesService";

import { ROLE_LABELS } from "../utils/roleLabels";
import AvatarImage from "../components/AvatarImage";

const ROLE_BADGE_CLASSES = {
    chef: "profile-badge-chef",
    influencer: "profile-badge-influencer"
};

function relativeTime(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric"
    });
}

const FeedHero = () => (
    <div className="feed-hero">
        <h1 className="feed-hero-title">Feed</h1>
        <p className="feed-hero-sub">
            Fresh recipes and creators from your Smart Kitchen community
        </p>
    </div>
);

function Feed() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [recipes, setRecipes]         = useState([]);
    const [likedIds, setLikedIds]       = useState(new Set());
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState("");

    const [creators, setCreators]       = useState([]);
    const [followedIds, setFollowedIds] = useState(new Set());

    const carouselRef = useRef(null);

    useEffect(() => {
        if (!currentUser) {
            navigate("/");
            return;
        }

        async function loadAll() {
            setLoading(true);
            try {
                // Fetch the feed; optional side-data is isolated so failures don't
                // block the main content.
                const [feedData, creatorData, followingData, likedData, favData] =
                    await Promise.all([
                        getFeed(),
                        getDiscoverCreators().catch(() => []),
                        getFollowing(currentUser.userId).catch(() => []),
                        getUserLikedRecipeIds(currentUser.userId).catch(() => []),
                        getUserFavorites(currentUser.userId).catch(() => [])
                    ]);

                setRecipes(Array.isArray(feedData) ? feedData : []);

                const followedSet = new Set(
                    Array.isArray(followingData) ? followingData.map(u => u.userId) : []
                );
                setFollowedIds(followedSet);

                // Exclude the current user and anyone already followed
                const filtered = (Array.isArray(creatorData) ? creatorData : [])
                    .filter(c => c.userId !== currentUser.userId && !followedSet.has(c.userId));
                setCreators(filtered);

                setLikedIds(new Set(
                    Array.isArray(likedData) ? likedData.map(Number) : []
                ));
                setFavoriteIds(new Set(
                    Array.isArray(favData) ? favData.map(f => f.recipeId) : []
                ));
            } catch {
                setError("Could not load your feed. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        loadAll();
    }, [currentUser, navigate]);

    async function handleLikeClick(recipe) {
        const id = recipe.recipeId;
        const isCurrentlyLiked = likedIds.has(id);
        const delta = isCurrentlyLiked ? -1 : 1;
        try {
            if (isCurrentlyLiked) {
                await unlikeRecipe(id);
                setLikedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await likeRecipe(id);
                setLikedIds(prev => new Set([...prev, id]));
            }
            setRecipes(prev => prev.map(r =>
                r.recipeId === id
                    ? { ...r, likeCount: Math.max(0, (r.likeCount || 0) + delta) }
                    : r
            ));
            // Keep modal in sync if it's open for this recipe
            setSelectedRecipe(prev =>
                prev?.recipeId === id
                    ? { ...prev, likeCount: Math.max(0, (prev.likeCount || 0) + delta) }
                    : prev
            );
        } catch { /* non-critical */ }
    }

    async function handleFavoriteClick(recipe) {
        const id = recipe.recipeId;
        const isFav = favoriteIds.has(id);
        try {
            if (isFav) {
                await removeFavorite(currentUser.userId, id);
                setFavoriteIds(prev => { const n = new Set(prev); n.delete(id); return n; });
            } else {
                await addFavorite(currentUser.userId, id);
                setFavoriteIds(prev => new Set([...prev, id]));
            }
        } catch { /* non-critical */ }
    }

    function scrollCarousel(dir) {
        carouselRef.current?.scrollBy({ left: dir * 240, behavior: "smooth" });
    }

    if (loading) {
        return (
            <div className="feed-page">
                <FeedHero />
                <div className="feed-status">Loading your feed…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed-page">
                <FeedHero />
                <div className="feed-status feed-status--error">{error}</div>
            </div>
        );
    }

    return (
        <div className="feed-page">
            <FeedHero />

            {/* Recipe detail modal — reuses the same implementation as Recipes page */}
            <RecipeDetailsModal
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
                isLiked={selectedRecipe ? likedIds.has(selectedRecipe.recipeId) : false}
                onLikeClick={handleLikeClick}
            />

            {/* ── Creator carousel ── */}
            {creators.length > 0 && (
                <section className="feed-section">
                    <h2 className="feed-section-title">Creators you may like</h2>
                    <div className="feed-carousel-wrapper">
                        <button
                            type="button"
                            className="feed-carousel-arrow feed-carousel-arrow--left"
                            onClick={() => scrollCarousel(-1)}
                            aria-label="Scroll creators left"
                        >
                            ‹
                        </button>

                        <div className="feed-carousel" ref={carouselRef}>
                            {creators.map(creator => (
                                <div key={creator.userId} className="feed-creator-card">
                                    <Link
                                        to={`/profile/${creator.userId}`}
                                        className="feed-creator-card-top"
                                        aria-label={`View ${creator.firstName} ${creator.lastName}'s profile`}
                                    >
                                        <AvatarImage
                                            avatarKey={creator.avatarKey}
                                            firstName={creator.firstName}
                                            lastName={creator.lastName}
                                            size="lg"
                                            className="feed-creator-card-avatar"
                                        />
                                        <p className="feed-creator-card-name">
                                            {creator.firstName} {creator.lastName}
                                        </p>
                                        {creator.username && (
                                            <p className="feed-creator-card-username">@{creator.username}</p>
                                        )}
                                        <span className={`feed-role-badge ${ROLE_BADGE_CLASSES[creator.userRole] || ""}`}>
                                            {ROLE_LABELS[creator.userRole] || creator.userRole}
                                        </span>
                                        <div className="feed-creator-card-stats">
                                            <div className="feed-creator-stat">
                                                <strong>{creator.recipeCount}</strong>
                                                <span>Recipes</span>
                                            </div>
                                            <div className="feed-creator-stat">
                                                <strong>{creator.followerCount ?? 0}</strong>
                                                <span>Followers</span>
                                            </div>
                                        </div>
                                    </Link>
                                    <FollowButton
                                        key={creator.userId}
                                        targetUserId={creator.userId}
                                        initialIsFollowing={followedIds.has(creator.userId)}
                                        onFollowChange={(delta) => {
                                            // Keep followedIds in sync (drives initialIsFollowing on next mount)
                                            setFollowedIds(prev => {
                                                const next = new Set(prev);
                                                if (delta === 1) next.add(creator.userId);
                                                else next.delete(creator.userId);
                                                return next;
                                            });
                                            // Update follower count on the card without removing it from view
                                            setCreators(prev => prev.map(c =>
                                                c.userId === creator.userId
                                                    ? { ...c, followerCount: (c.followerCount ?? 0) + delta }
                                                    : c
                                            ));
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="feed-carousel-arrow feed-carousel-arrow--right"
                            onClick={() => scrollCarousel(1)}
                            aria-label="Scroll creators right"
                        >
                            ›
                        </button>
                    </div>
                </section>
            )}

            {/* ── Recipe feed ── */}
            <section className="feed-section">
                <h2 className="feed-section-title">Latest from people you follow</h2>

                {recipes.length === 0 ? (
                    <div className="feed-empty">
                        <p className="feed-empty-icon">🍽️</p>
                        <p className="feed-empty-title">Your feed is empty</p>
                        <p className="feed-empty-sub">
                            Follow chefs and Foodies to start building your Feed.
                        </p>
                        <Link to="/discover" className="feed-browse-link">
                            Discover Creators
                        </Link>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {recipes.map(recipe => (
                            <div key={recipe.recipeId} className="feed-card-wrapper">
                                {recipe.creator && (
                                    <div className="feed-recipe-meta">
                                        <Link
                                            to={`/profile/${recipe.creator.userId}`}
                                            className="feed-recipe-creator"
                                        >
                                            <span className="feed-recipe-avatar">
                                                {recipe.creator.firstName?.[0]}
                                                {recipe.creator.lastName?.[0]}
                                            </span>
                                            <span className="feed-recipe-creator-name">
                                                {recipe.creator.firstName} {recipe.creator.lastName}
                                            </span>
                                            {recipe.creator.userRole &&
                                                ROLE_LABELS[recipe.creator.userRole] && (
                                                <span className={`feed-role-badge feed-role-badge--sm ${ROLE_BADGE_CLASSES[recipe.creator.userRole] || ""}`}>
                                                    {ROLE_LABELS[recipe.creator.userRole]}
                                                </span>
                                            )}
                                        </Link>
                                        {recipe.createdAt && (
                                            <span className="feed-recipe-date">
                                                {relativeTime(recipe.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={setSelectedRecipe}
                                    showLikeButton
                                    isLiked={likedIds.has(recipe.recipeId)}
                                    likeCount={recipe.likeCount || 0}
                                    onLikeClick={handleLikeClick}
                                    showFavoriteButton
                                    isFavorite={favoriteIds.has(recipe.recipeId)}
                                    onFavoriteClick={handleFavoriteClick}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Feed;
