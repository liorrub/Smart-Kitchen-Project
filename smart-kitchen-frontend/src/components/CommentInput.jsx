import "./CommentInput.css";

import { useState, useRef, useEffect } from "react";

import AppButton from "./AppButton";

// How long to wait after the user stops typing before clearing the typing indicator.
const TYPING_DEBOUNCE_MS = 1000;

function getInitials(user) {
    if (!user) return "?";
    return `${(user.firstName || "?")[0]}${(user.lastName || "")[0] || ""}`.toUpperCase();
}

// Comment input box.
// Emits typing events with debounce, sends comments via Socket.IO,
// and supports replying to a specific comment and @mentioning a discussion participant.
// participants — array of { userId, firstName, lastName } derived from existing comments (no extra API call).
function CommentInput({ recipeId, socket, currentUser, replyTo, onClearReply, participants = [] }) {
    const [content, setContent] = useState("");
    const [mentionedUserId, setMentionedUserId] = useState(null);
    const [mentionedUserName, setMentionedUserName] = useState("");
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");

    const typingTimerRef = useRef(null);
    const isTypingRef = useRef(false);

    // Emit stopTyping on unmount if the user was typing
    useEffect(() => {
        return () => {
            clearTimeout(typingTimerRef.current);
            if (isTypingRef.current) {
                socket?.emit("stopTypingRecipeComment", { recipeId });
            }
        };
    }, [socket, recipeId]);

    // Close the mention dropdown when clicking outside it
    useEffect(() => {
        function handleOutsideClick(e) {
            if (!e.target.closest(".comment-input-mention-area")) {
                setShowMentionDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    // Open the @mention dropdown — shows only users who already commented in this discussion
    function openMentionDropdown() {
        setMentionSearch("");
        setShowMentionDropdown(true);
    }

    function selectMentionUser(user) {
        setMentionedUserId(user.userId);
        setMentionedUserName(`${user.firstName} ${user.lastName}`);
        setShowMentionDropdown(false);
    }

    function clearMention() {
        setMentionedUserId(null);
        setMentionedUserName("");
    }

    // Emit typingRecipeComment once, then debounce stopTypingRecipeComment
    function handleTyping() {
        if (!isTypingRef.current) {
            socket?.emit("typingRecipeComment", { recipeId });
            isTypingRef.current = true;
        }
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => {
            socket?.emit("stopTypingRecipeComment", { recipeId });
            isTypingRef.current = false;
        }, TYPING_DEBOUNCE_MS);
    }

    function handleContentChange(e) {
        setContent(e.target.value);
        handleTyping();
    }

    // Send the comment via Socket.IO and reset the form
    function handleSubmit() {
        const trimmed = content.trim();
        if (!trimmed || !socket) return;

        socket.emit("sendRecipeComment", {
            recipeId,
            content: trimmed,
            tags: null,
            parentCommentId: replyTo?.commentId ?? null,
            mentionedUserId: mentionedUserId ?? null
        });

        clearTimeout(typingTimerRef.current);
        socket.emit("stopTypingRecipeComment", { recipeId });
        isTypingRef.current = false;

        setContent("");
        clearMention();
        onClearReply?.();
    }

    // Ctrl+Enter / Cmd+Enter submits the comment
    function handleKeyDown(e) {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    }

    // Filter participants by search term (already excludes the current user)
    const filteredUsers = participants.filter((u) =>
        `${u.firstName} ${u.lastName}`
            .toLowerCase()
            .includes(mentionSearch.toLowerCase())
    );

    const initials = getInitials(currentUser);

    return (
        <div className="comment-input-container">
            {/* Reply context bar — shown when replying to a specific comment */}
            {replyTo && (
                <div className="comment-input-reply-bar">
                    <span>
                        ↩ Replying to{" "}
                        <strong>
                            {replyTo.author?.firstName} {replyTo.author?.lastName}
                        </strong>
                    </span>
                    <button
                        type="button"
                        className="comment-input-reply-clear"
                        onClick={onClearReply}
                        aria-label="Cancel reply"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="comment-input-row">
                <div className="comment-avatar comment-input-avatar">{initials}</div>

                <div className="comment-input-right">
                    <textarea
                        className="comment-input-field"
                        value={content}
                        onChange={handleContentChange}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            replyTo
                                ? `Reply to ${replyTo.author?.firstName}...`
                                : "Join the discussion... (Ctrl+Enter to send)"
                        }
                        rows={3}
                    />

                    {/* Active @mention chip */}
                    {mentionedUserName && (
                        <div className="comment-input-mention-chip">
                            <span>@{mentionedUserName}</span>
                            <button
                                type="button"
                                onClick={clearMention}
                                aria-label="Remove mention"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="comment-input-footer">
                        {/* @mention button + user dropdown */}
                        <div className="comment-input-mention-area">
                            <button
                                type="button"
                                className="comment-input-at-btn"
                                onClick={openMentionDropdown}
                            >
                                @ Mention
                            </button>

                            {showMentionDropdown && (
                                <div className="comment-input-mention-dropdown">
                                    {participants.length === 0 ? (
                                        <p className="mention-no-results">
                                            No users in this discussion yet
                                        </p>
                                    ) : (
                                        <>
                                            <input
                                                className="mention-search-input"
                                                type="text"
                                                placeholder="Filter participants..."
                                                value={mentionSearch}
                                                onChange={(e) => setMentionSearch(e.target.value)}
                                                autoFocus
                                            />
                                            <div className="mention-user-list">
                                                {filteredUsers.length === 0 && (
                                                    <p className="mention-no-results">No match</p>
                                                )}
                                                {filteredUsers.map((user) => (
                                                    <button
                                                        key={user.userId}
                                                        type="button"
                                                        className="mention-user-item"
                                                        onClick={() => selectMentionUser(user)}
                                                    >
                                                        <span className="mention-user-avatar">
                                                            {`${user.firstName[0]}${user.lastName?.[0] || ""}`.toUpperCase()}
                                                        </span>
                                                        {user.firstName} {user.lastName}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <AppButton
                            variant="primary"
                            size="small"
                            onClick={handleSubmit}
                            disabled={!content.trim()}
                        >
                            Send
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommentInput;
