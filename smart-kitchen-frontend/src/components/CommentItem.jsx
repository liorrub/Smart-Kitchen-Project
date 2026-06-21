import "./CommentItem.css";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AppButton from "./AppButton";

// Build initials from a user's first and last name.
function getInitials(firstName, lastName) {
    return `${(firstName || "?")[0]}${(lastName || "")[0] || ""}`.toUpperCase();
}

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
// onEdit(commentId, newContent) — called when the user saves an inline edit (socket emission handled by parent).
// onDeleteRequest(comment)     — called when the user clicks Delete; parent shows a confirmation modal.
function CommentItem({ comment, currentUser, onReply, onEdit, onDeleteRequest, isReply = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);

    // Keep the edit textarea in sync if another user edits the same comment
    useEffect(() => {
        setEditContent(comment.content);
    }, [comment.content]);

    const author = comment.author || {};
    const mentionedUser = comment.mentionedUser;

    const authorName = `${author.firstName || "Unknown"} ${author.lastName || ""}`.trim();
    const initials = getInitials(author.firstName, author.lastName);

    const isOwner = currentUser?.userId === comment.userId;
    const isAdmin = currentUser?.userRole === "admin";
    const canEditOrDelete = isOwner || isAdmin;

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
                    <div className="comment-avatar">{initials}</div>
                </Link>
            ) : (
                <div className="comment-avatar">{initials}</div>
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
