import "./CommentItem.css";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AppButton from "./AppButton";
import AvatarImage from "./AvatarImage";

function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Single comment card — shows author, timestamp, content, optional @mention, and action buttons.
// Used for both top-level comments and indented replies (isReply=true).
// onEdit(commentId, newContent)  — called when the user saves an inline edit.
// onDeleteRequest(comment)       — called when the user clicks Delete.
// onLikeClick(commentId)         — called when the user clicks the like button.
// isLiking                       — true while the like/unlike API call is pending.
function CommentItem({
    comment,
    currentUser,
    onReply,
    onEdit,
    onDeleteRequest,
    isReply = false,
    onLikeClick,
    isLiking = false
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Keep the edit textarea in sync if another user edits the same comment
    useEffect(() => {
        setEditContent(comment.content);
    }, [comment.content]);

    const author = comment.author || {};
    const mentionedUser = comment.mentionedUser;

    const authorName = `${author.firstName || "Unknown"} ${author.lastName || ""}`.trim();

    const isOwner = currentUser?.userId === comment.userId;
    const isAdmin = currentUser?.userRole === "admin";
    const canEditOrDelete = isOwner || isAdmin;

    // Like state derived from the comment object (managed by parent)
    const likeCount = comment.likeCount ?? 0;
    const isLikedByMe = comment.isLikedByMe ?? false;
    const isSelf = currentUser?.userId === comment.userId;

    function handleSave() {
        const trimmed = editContent.trim();
        if (!trimmed || trimmed === comment.content) {
            setIsEditing(false);
            return;
        }
        onEdit?.(comment.commentId, trimmed);
        setIsEditing(false);
    }

    function handleCancelEdit() {
        setEditContent(comment.content);
        setIsEditing(false);
    }

    const likeLabel = isLikedByMe ? "Unlike comment" : "Like comment";
    const likeDisabled = isSelf || isLiking;

    return (
        <article
            id={`comment-${comment.commentId}`}
            className={`comment-card${isReply ? " comment-card-reply" : ""}`}
        >
            {author.userId ? (
                <Link
                    to={`/profile/${author.userId}`}
                    className="comment-avatar-link"
                    aria-label={`View ${authorName}'s profile`}
                >
                    <AvatarImage
                        avatarKey={author.avatarKey}
                        firstName={author.firstName}
                        lastName={author.lastName}
                        size="sm"
                        className="comment-avatar"
                    />
                </Link>
            ) : (
                <AvatarImage
                    avatarKey={author.avatarKey}
                    firstName={author.firstName}
                    lastName={author.lastName}
                    size="sm"
                    className="comment-avatar"
                />
            )}

            <div className="comment-body">
                <div className="comment-header">
                    {author.userId ? (
                        <Link
                            to={`/profile/${author.userId}`}
                            className="comment-author-link"
                        >
                            <strong className="comment-author">{authorName}</strong>
                        </Link>
                    ) : (
                        <strong className="comment-author">{authorName}</strong>
                    )}
                    <span className="comment-date">{formatDate(comment.updatedAt || comment.createdAt)}</span>
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="comment-edited">(edited)</span>
                    )}
                </div>

                {/* Reply indicator: shown only on reply cards that have a mentioned user */}
                {isReply && mentionedUser && (
                    <p className="comment-reply-to">
                        ↩ In reply to{" "}
                        <span className="comment-mention">
                            @{mentionedUser.firstName} {mentionedUser.lastName}
                        </span>
                    </p>
                )}

                {/* Inline edit mode — textarea replaces the content paragraph */}
                {isEditing ? (
                    <div className="comment-edit-area">
                        <textarea
                            className="comment-edit-input"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            autoFocus
                        />
                        <div className="comment-edit-actions">
                            <AppButton variant="primary" size="small" onClick={handleSave}>
                                Save
                            </AppButton>
                            <AppButton variant="ghost" size="small" onClick={handleCancelEdit}>
                                Cancel
                            </AppButton>
                        </div>
                    </div>
                ) : (
                    <p className="comment-content">{comment.content}</p>
                )}

                {/* @mention pill on top-level comments */}
                {!isReply && mentionedUser && (
                    <div className="comment-mention-row">
                        <span className="comment-mention">
                            @{mentionedUser.firstName} {mentionedUser.lastName}
                        </span>
                    </div>
                )}

                <div className="comment-actions">
                    {/* Like button — always visible, disabled for own comments */}
                    {!isEditing && (
                        <button
                            type="button"
                            className={`comment-like-btn${isLikedByMe ? " liked" : ""}${isSelf ? " self" : ""}`}
                            onClick={() => onLikeClick?.(comment.commentId)}
                            disabled={likeDisabled}
                            aria-pressed={isLikedByMe}
                            aria-label={isSelf ? "Cannot like your own comment" : likeLabel}
                            title={isSelf ? "You cannot like your own comment" : likeLabel}
                        >
                            <span className="comment-like-icon" aria-hidden="true">
                                {isLikedByMe ? "♥" : "♡"}
                            </span>
                            <span className="comment-like-count">{likeCount}</span>
                        </button>
                    )}

                    {!isEditing && (
                        <AppButton variant="ghost" size="small" onClick={onReply}>
                            ↩ Reply
                        </AppButton>
                    )}

                    {canEditOrDelete && !isEditing && (
                        <AppButton
                            variant="ghost"
                            size="small"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </AppButton>
                    )}

                    {canEditOrDelete && !isEditing && (
                        <AppButton
                            variant="danger"
                            size="small"
                            onClick={() => onDeleteRequest?.(comment)}
                        >
                            Delete
                        </AppButton>
                    )}
                </div>
            </div>
        </article>
    );
}

export default CommentItem;
