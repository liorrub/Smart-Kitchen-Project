import "./RecipeDiscussion.css";
import "../components/MessageModal.css";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import CommentItem from "../components/CommentItem";
import CommentInput from "../components/CommentInput";
import AppButton from "../components/AppButton";

import { getRecipeById } from "../services/recipeService";
import { getComments } from "../services/recipeCommentsService";
import { likeComment, unlikeComment } from "../services/commentLikeService";
import { connectSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";
import { formatText } from "../utils/formatUtils";

// Map recipe category to the same color-coded border class used in RecipeDetailsModal
function getCategoryClass(category) {
    const map = {
        breakfast: "recipe-modal-breakfast",
        lunch:     "recipe-modal-lunch",
        dinner:    "recipe-modal-dinner",
        snack:     "recipe-modal-snack"
    };
    return map[category] || "recipe-modal-default";
}

// Full-page recipe discussion.
// Loads recipe details and comment history on mount, then connects to Socket.IO
// for real-time comments, typing indicators, viewer count, and edit/delete events.
function RecipeDiscussion() {
    const { id: recipeId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetCommentId = searchParams.get("commentId")
        ? Number(searchParams.get("commentId"))
        : null;

    // Read from AuthContext (React state) — not from localStorage.
    // AuthContext is initialized once per tab, so switching users in another tab
    // does not affect the identity of this tab.
    const { user: currentUser } = useAuth();

    const [recipe, setRecipe] = useState(null);
    const [comments, setComments] = useState([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: userName }
    const [replyTo, setReplyTo] = useState(null);       // comment being replied to
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Comment pending delete confirmation — null or the full comment object
    const [confirmDeleteComment, setConfirmDeleteComment] = useState(null);
    const [socketError, setSocketError] = useState(null);
    const [commentNotFound, setCommentNotFound] = useState(false);

    // Set of commentIds currently pending a like/unlike API call (prevents duplicate clicks)
    const [likingCommentIds, setLikingCommentIds] = useState(new Set());

    const socketRef = useRef(null);

    // Load recipe details and existing comments via REST
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [recipeData, commentsData] = await Promise.all([
                    getRecipeById(recipeId),
                    getComments(recipeId)
                ]);
                setRecipe(recipeData);
                setComments(Array.isArray(commentsData) ? commentsData : []);
            } catch (err) {
                const status = err?.response?.status;
                if (status === 404) {
                    setError("This recipe discussion is no longer available.");
                } else {
                    setError("Failed to load recipe discussion.");
                }
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [recipeId]);

    // After comments load, scroll to and highlight the target comment (from ?commentId=).
    // Uses useCallback so the effect dep array is stable across renders.
    const scrollToComment = useCallback(() => {
        if (!targetCommentId || loading) return;
        const el = document.getElementById(`comment-${targetCommentId}`);
        if (!el) {
            // Comment was deleted or doesn't exist — show a friendly banner
            setCommentNotFound(true);
            return;
        }
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("comment-highlight");
        const timer = setTimeout(() => el.classList.remove("comment-highlight"), 3000);
        return () => clearTimeout(timer);
    }, [targetCommentId, loading]);

    useEffect(() => {
        const cleanup = scrollToComment();
        return cleanup;
    }, [scrollToComment]);

    // Connect to Socket.IO, join the recipe room, and listen for real-time events.
    // Cleanup leaves the room and disconnects on unmount.
    useEffect(() => {
        if (!currentUser?.userId) return;

        const socket = connectSocket(currentUser.userId);
        socketRef.current = socket;

        socket.emit("joinRecipeRoom", { recipeId: Number(recipeId) });

        // Append incoming comment to the local list
        socket.on("newRecipeComment", (comment) => {
            setComments((prev) => [...prev, comment]);
        });

        // Update content of an edited comment in the flat list
        socket.on("recipeCommentEdited", ({ commentId, content, updatedAt }) => {
            setComments((prev) =>
                prev.map((c) =>
                    c.commentId === commentId ? { ...c, content, updatedAt } : c
                )
            );
        });

        // Remove a deleted comment and all its direct replies
        socket.on("recipeCommentDeleted", ({ commentId }) => {
            setComments((prev) =>
                prev.filter(
                    (c) => c.commentId !== commentId && c.parentCommentId !== commentId
                )
            );
            // Clear the confirm modal if the deleted comment was the one pending
            setConfirmDeleteComment((pending) =>
                pending?.commentId === commentId ? null : pending
            );
        });

        socket.on("roomUserCount", ({ count }) => {
            setViewerCount(count);
        });

        socket.on("userTyping", ({ userId, userName }) => {
            setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
        });

        socket.on("userStoppedTyping", ({ userId }) => {
            setTypingUsers((prev) => {
                const next = { ...prev };
                delete next[userId];
                return next;
            });
        });

        // Show a temporary error banner when the server rejects an edit/delete
        socket.on("commentError", ({ message }) => {
            setSocketError(message);
            setTimeout(() => setSocketError(null), 4000);
        });

        // Update like count for a specific comment (broadcast from any user's like/unlike)
        socket.on("commentLikeUpdated", ({ commentId, likeCount }) => {
            setComments((prev) =>
                prev.map((c) =>
                    c.commentId === commentId ? { ...c, likeCount } : c
                )
            );
        });

        return () => {
            socket.emit("leaveRecipeRoom", { recipeId: Number(recipeId) });
            socket.off("newRecipeComment");
            socket.off("recipeCommentEdited");
            socket.off("recipeCommentDeleted");
            socket.off("roomUserCount");
            socket.off("userTyping");
            socket.off("userStoppedTyping");
            socket.off("commentError");
            socket.off("commentLikeUpdated");
            // Socket lifecycle is managed by NotificationContext; do not disconnect here
        };
    }, [recipeId, currentUser?.userId]);

    // Toggle like/unlike for a comment with optimistic UI.
    // Reverts optimistic state on API failure.
    async function handleLikeComment(commentId) {
        if (likingCommentIds.has(commentId)) return;

        const comment = comments.find((c) => c.commentId === commentId);
        if (!comment) return;

        const wasLiked = comment.isLikedByMe ?? false;
        const prevCount = comment.likeCount ?? 0;

        // Optimistic update
        setLikingCommentIds((prev) => new Set(prev).add(commentId));
        setComments((prev) =>
            prev.map((c) =>
                c.commentId === commentId
                    ? {
                          ...c,
                          isLikedByMe: !wasLiked,
                          likeCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1
                      }
                    : c
            )
        );

        try {
            const result = wasLiked
                ? await unlikeComment(commentId)
                : await likeComment(commentId);

            // Sync with authoritative server values
            setComments((prev) =>
                prev.map((c) =>
                    c.commentId === commentId
                        ? { ...c, likeCount: result.likeCount, isLikedByMe: result.isLikedByMe }
                        : c
                )
            );
        } catch {
            // Revert optimistic update on failure
            setComments((prev) =>
                prev.map((c) =>
                    c.commentId === commentId
                        ? { ...c, isLikedByMe: wasLiked, likeCount: prevCount }
                        : c
                )
            );
        } finally {
            setLikingCommentIds((prev) => {
                const next = new Set(prev);
                next.delete(commentId);
                return next;
            });
        }
    }

    // Emit an edit event via Socket.IO — the server validates ownership and broadcasts back
    function handleEditComment(commentId, newContent) {
        socketRef.current?.emit("editRecipeComment", {
            recipeId: Number(recipeId),
            commentId,
            content: newContent
        });
    }

    // Open the delete confirmation modal
    function handleDeleteRequest(comment) {
        setConfirmDeleteComment(comment);
    }

    // Emit a delete event via Socket.IO after the user confirms in the modal
    function handleConfirmDelete() {
        if (!confirmDeleteComment) return;
        socketRef.current?.emit("deleteRecipeComment", {
            recipeId: Number(recipeId),
            commentId: confirmDeleteComment.commentId
        });
        setConfirmDeleteComment(null);
    }

    // Build typing indicator text from the current typingUsers map
    const typingNames = Object.values(typingUsers);
    let typingText = "";
    if (typingNames.length === 1) typingText = `${typingNames[0]} is typing...`;
    else if (typingNames.length >= 2) typingText = `${typingNames[0]} and ${typingNames[1]} are typing...`;

    // Build unique participant list from comment authors, excluding the current user.
    // Derived from already-loaded comments state — no extra API call needed (Lecture 7).
    const participants = Object.values(
        comments.reduce((acc, c) => {
            if (c.author && c.author.userId !== currentUser?.userId) {
                acc[c.author.userId] = c.author;
            }
            return acc;
        }, {})
    );

    // Separate flat comment list into top-level and replies
    const topLevelComments = comments.filter((c) => c.parentCommentId === null);

    if (loading) {
        return (
            <div className="discussion-page">
                <p className="discussion-loading">Loading recipe discussion...</p>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="discussion-page">
                <div className="discussion-unavailable">
                    <p className="discussion-error">{error || "Recipe not found."}</p>
                    <button
                        type="button"
                        className="discussion-back-btn"
                        onClick={() => navigate(-1)}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    const categoryClass = getCategoryClass(recipe.category);
    const creatorName = recipe.creator
        ? `${recipe.creator.firstName} ${recipe.creator.lastName}`
        : `Chef #${recipe.creatorId}`;

    return (
        <div className="discussion-page">

            {/* ── Recipe header ── */}
            <section className={`discussion-recipe-header ${categoryClass}`}>
                <button
                    type="button"
                    className="discussion-back-btn"
                    onClick={() => navigate("/recipes")}
                >
                    ← Back to Recipes
                </button>

                <div className="discussion-recipe-header-body">
                    <p className="recipe-modal-label">{formatText(recipe.category)}</p>

                    <h1 className="discussion-recipe-title">{recipe.title}</h1>

                    <p className="discussion-recipe-subtitle">
                        {formatText(recipe.cuisine)} cuisine · {formatText(recipe.difficulty)}
                    </p>

                    <p className="discussion-chef">By {creatorName}</p>

                    <div className="discussion-stats-row">
                        <div className="discussion-stat">
                            <strong>{recipe.prepTime || 0}</strong>
                            <span>Prep min</span>
                        </div>
                        <div className="discussion-stat">
                            <strong>{recipe.cookTime || 0}</strong>
                            <span>Cook min</span>
                        </div>
                        <div className="discussion-stat">
                            <strong>{recipe.totalTime || 0}</strong>
                            <span>Total min</span>
                        </div>
                        <div className="discussion-stat">
                            <strong>{recipe.servings || 1}</strong>
                            <span>Servings</span>
                        </div>
                        <div className="discussion-stat">
                            <strong>{recipe.calories || 0}</strong>
                            <span>Calories</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Discussion section ── */}
            <section className="discussion-section">

                {/* Live bar: title, viewer count, typing indicator */}
                <div className="discussion-section-header">
                    <div className="discussion-section-title-row">
                        <span>💬</span>
                        <h2>Discussion</h2>
                    </div>

                    <div className="discussion-live-bar">
                        <span className="discussion-viewers">
                            👁 {viewerCount} {viewerCount === 1 ? "user" : "users"} viewing
                        </span>
                        {typingText && (
                            <span className="discussion-typing">✏️ {typingText}</span>
                        )}
                    </div>
                </div>

                {/* Error banner for rejected socket actions (auto-dismisses) */}
                {socketError && (
                    <div className="discussion-socket-error">{socketError}</div>
                )}

                {/* Friendly notice when the linked comment was deleted */}
                {commentNotFound && (
                    <div className="discussion-comment-missing">
                        This comment is no longer available.
                    </div>
                )}

                {/* Comment list: top-level comments followed by their indented replies */}
                <div className="discussion-comments-list">
                    {topLevelComments.length === 0 && (
                        <p className="discussion-empty">
                            No comments yet. Be the first to join the discussion!
                        </p>
                    )}

                    {topLevelComments.map((comment) => {
                        const replies = comments.filter(
                            (c) => c.parentCommentId === comment.commentId
                        );

                        return (
                            <div key={comment.commentId} className="discussion-comment-thread">
                                <CommentItem
                                    comment={comment}
                                    currentUser={currentUser}
                                    onReply={() => setReplyTo(comment)}
                                    onEdit={handleEditComment}
                                    onDeleteRequest={handleDeleteRequest}
                                    onLikeClick={handleLikeComment}
                                    isLiking={likingCommentIds.has(comment.commentId)}
                                />

                                {replies.length > 0 && (
                                    <div className="discussion-replies">
                                        {replies.map((reply) => (
                                            <CommentItem
                                                key={reply.commentId}
                                                comment={reply}
                                                currentUser={currentUser}
                                                isReply
                                                onReply={() => setReplyTo(comment)}
                                                onEdit={handleEditComment}
                                                onDeleteRequest={handleDeleteRequest}
                                                onLikeClick={handleLikeComment}
                                                isLiking={likingCommentIds.has(reply.commentId)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Write box */}
                <CommentInput
                    recipeId={Number(recipeId)}
                    socket={socketRef.current}
                    currentUser={currentUser}
                    replyTo={replyTo}
                    onClearReply={() => setReplyTo(null)}
                    participants={participants}
                />
            </section>

            {/* ── Delete confirmation modal ── */}
            {confirmDeleteComment && (
                <div
                    className="message-modal-overlay"
                    onClick={() => setConfirmDeleteComment(null)}
                >
                    <div
                        className="message-modal-card message-modal-error"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p>Are you sure you want to delete this comment?</p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
                            <AppButton
                                variant="secondary"
                                onClick={() => setConfirmDeleteComment(null)}
                            >
                                Cancel
                            </AppButton>
                            <AppButton
                                variant="danger"
                                onClick={handleConfirmDelete}
                            >
                                Delete
                            </AppButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RecipeDiscussion;
