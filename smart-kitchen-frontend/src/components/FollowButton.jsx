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
    const [isHovered, setIsHovered]     = useState(false);

    const showUnfollowState = isFollowing && !loading && isHovered;

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
            console.error("Follow action failed:", err);
        } finally {
            setLoading(false);
            setIsHovered(false);
        }
    }

    let buttonClass = "follow-btn ";
    if (loading)               buttonClass += "follow-btn--loading";
    else if (showUnfollowState) buttonClass += "follow-btn--unfollow";
    else if (isFollowing)       buttonClass += "follow-btn--following";
    else                        buttonClass += "follow-btn--unfollowed";

    const buttonText = loading ? "Updating..." : showUnfollowState ? "Unfollow" : isFollowing ? "Following" : "Follow";
    const ariaLabel  = isFollowing ? "Unfollow" : "Follow";

    return (
        <button
            type="button"
            className={buttonClass}
            onClick={handleClick}
            disabled={loading}
            aria-label={ariaLabel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
        >
            {buttonText}
        </button>
    );
}

export default FollowButton;
