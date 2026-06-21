import "./Feed.css";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import PageHero from "../components/PageHero";

import { getFeed } from "../services/followService";
import { getUserLikedRecipeIds, likeRecipe, unlikeRecipe } from "../services/likeService";

function Feed() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const [recipes, setRecipes]           = useState([]);
    const [likedIds, setLikedIds]         = useState(new Set());
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState("");

    useEffect(() => {
        if (!currentUser) {
            navigate("/");
            return;
        }

        async function loadFeed() {
            setLoading(true);
            setError("");
            try {
                const data = await getFeed();
                setRecipes(Array.isArray(data) ? data : []);
            } catch {
                setError("Could not load your feed. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        async function loadLikedIds() {
            try {
                const ids = await getUserLikedRecipeIds(currentUser.userId);
                setLikedIds(new Set(Array.isArray(ids) ? ids.map(Number) : []));
            } catch {
                // non-critical
            }
        }

        loadFeed();
        loadLikedIds();
    }, [currentUser, navigate]);

    async function handleLikeClick(recipe) {
        const id = recipe.recipeId;
        const isCurrentlyLiked = likedIds.has(id);
        try {
            if (isCurrentlyLiked) {
                await unlikeRecipe(id);
                setLikedIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
                setRecipes(prev => prev.map(r =>
                    r.recipeId === id ? { ...r, likeCount: Math.max(0, (r.likeCount || 0) - 1) } : r
                ));
            } else {
                await likeRecipe(id);
                setLikedIds(prev => new Set([...prev, id]));
                setRecipes(prev => prev.map(r =>
                    r.recipeId === id ? { ...r, likeCount: (r.likeCount || 0) + 1 } : r
                ));
            }
        } catch {
            // non-critical
        }
    }

    if (loading) {
        return (
            <div className="feed-page">
                <PageHero title="My Feed" subtitle="Recipes from people you follow" />
                <div className="feed-status">Loading your feed...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="feed-page">
                <PageHero title="My Feed" subtitle="Recipes from people you follow" />
                <div className="feed-status feed-status--error">{error}</div>
            </div>
        );
    }

    return (
        <div className="feed-page">
            <PageHero title="My Feed" subtitle="Recipes from people you follow" />

            <div className="feed-container">
                {recipes.length === 0 ? (
                    <div className="feed-empty">
                        <p className="feed-empty-title">Your feed is empty</p>
                        <p className="feed-empty-sub">
                            Follow chefs and influencers to see their latest recipes here.
                        </p>
                        <Link to="/recipes" className="feed-browse-link">
                            Browse Recipes
                        </Link>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {recipes.map(recipe => (
                            <div key={recipe.recipeId} className="feed-card-wrapper">
                                {recipe.creator && (
                                    <Link
                                        to={`/profile/${recipe.creator.userId}`}
                                        className="feed-creator-link"
                                    >
                                        <span className="feed-creator-avatar">
                                            {recipe.creator.firstName?.[0]}
                                            {recipe.creator.lastName?.[0]}
                                        </span>
                                        <span className="feed-creator-name">
                                            {recipe.creator.firstName} {recipe.creator.lastName}
                                        </span>
                                    </Link>
                                )}

                                <RecipeCard
                                    recipe={recipe}
                                    showLikeButton
                                    isLiked={likedIds.has(recipe.recipeId)}
                                    likeCount={recipe.likeCount || 0}
                                    onLikeClick={handleLikeClick}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Feed;
