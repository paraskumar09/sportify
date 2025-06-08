import React from 'react';
import './CommentModal.css'; // We'll create this CSS
import { toast } from "react-toastify";

export default function CommentModal({
    item,
    picLink,
    commentText,
    setCommentText,
    makeComment,
    toggleCommentModal,
    likePost,
    unlikePost,
    currentUser,
    deletePost
}) {
    const isLiked = item.likes.includes(currentUser._id);

    return (
        <div className="comment-modal-overlay">
            <div className="comment-modal-container">
                <div className="postPic">
                    <img src={item.photo} alt="Post" />
                </div>
                <div className="comment-modal-details">
                    <div className="modal-card-header">
                        <div className="card-pic">
                            <img
                                src={item.postedBy.Photo ? item.postedBy.Photo : picLink}
                                alt="Profile"
                            />
                        </div>
                        <h5>{item.postedBy.name}</h5>
                        {/* Delete post button in modal */}
                        {item.postedBy._id === currentUser._id && (
                            <span
                                className="material-symbols-outlined delete-icon"
                                onClick={() => {
                                    deletePost(item._id);
                                    toggleCommentModal(); // Close modal after delete
                                }}
                            >
                                delete
                            </span>
                        )}
                    </div>

                    <div className="comment-section">
                        {item.body && ( // Display main post body
                            <p className="main-caption">
                                <span className="caption-username">{item.postedBy.name}</span>{" "}
                                {item.body}
                            </p>
                        )}
                        {item.comments.length === 0 && (
                            <p className="no-comments-message">No comments yet. Be the first!</p>
                        )}
                        {item.comments.map((val) => {
                            return (
                                <p className="comment-item" key={val._id || Math.random()}>
                                    <span className="commenter-username">{val.postedBy.name}</span>{" "}
                                    <span className="comment-text">{val.comment}</span>
                                </p>
                            );
                        })}
                    </div>

                    <div className="comment-modal-actions">
                        <div className="likes-and-icons">
                            {isLiked ? (
                                <span
                                    className="material-symbols-outlined liked"
                                    onClick={() => unlikePost(item._id)}
                                >
                                    favorite
                                </span>
                            ) : (
                                <span
                                    className="material-symbols-outlined"
                                    onClick={() => likePost(item._id)}
                                >
                                    favorite
                                </span>
                            )}
                            <p className="likes-count">{item.likes.length} Likes</p>
                        </div>
                        {item.sports && <p className="modal-post-sport">Sport: <strong>{item.sports}</strong></p>}
                    </div>

                    <div className="add-comment">
                        <span className="material-symbols-outlined">mood</span>
                        <input
                            type="text"
                            placeholder="Add a comment"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    if (commentText.trim()) {
                                        makeComment(commentText, item._id);
                                    } else {
                                        toast.error("Comment cannot be empty.");
                                    }
                                }
                            }}
                        />
                        <button
                            className="comment-btn"
                            onClick={() => {
                                if (commentText.trim()) {
                                    makeComment(commentText, item._id);
                                } else {
                                    toast.error("Comment cannot be empty.");
                                }
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div>
                <div
                    className="comment-modal-close"
                    onClick={toggleCommentModal}
                >
                    <span className="material-symbols-outlined">close</span>
                </div>
            </div>
        </div>
    );
}