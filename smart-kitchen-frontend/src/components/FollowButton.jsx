import "./FollowButton.css";

import { useState } from "react";

import { followUser, unfollowUser } from "../services/followService";

/*
    Reusable Follow / Unfollow button.

    Props:
        targetUserId        — ID of the user to follow / unfollow
        initialIsFollowing  — current follow state (bool)
        onFollowChange      — optional callback(delta: +1 | -1) for parent to update counts
*/
function FollowButton({ targetUserId, initialIsFollowing, onFollowChange }) {
    const [isFollowing, setIsFollowing] = useState(Boolean(initialIsFollowing));
    const [loading, setLoading]         = useState(false);

    async function handleClick() {
        if (loading) return;
        setLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(targetUserId);
                setIsFollowing(false);
                if (onFollowChange) onFollowChange(-1);
            } else {
                await followUser(targetUserId);
                setIsFollowing(true);
                if (onFollowChange) onFollowChange(+1);
            }
        } catch (err) {
            // Silently revert — the current state is still valid
            console.error("Follow action failed:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            className={
                loading
                    ? "follow-btn follow-btn--loading"
                    : isFollowing
                        ? "follow-btn follow-btn--following"
                        : "follow-btn follow-btn--unfollowed"
            }
            onClick={handleClick}
            disabled={loading}
            aria-pressed={isFollowing}
        >
            {loading ? "..." : isFollowing ? "Following" : "Follow"}
        </button>
    );
}

export default FollowButton;
