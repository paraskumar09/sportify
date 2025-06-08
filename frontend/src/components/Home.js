import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";
import CommentModal from "./CommentModal";

export default function Home() {
    const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null); // Changed to null for clarity
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true); // Initial loading of posts
    const [isFetchingMore, setIsFetchingMore] = useState(false); // For infinite scroll loading
    const [currentPage, setCurrentPage] = useState(0); // For pagination
    const [hasMore, setHasMore] = useState(true); // To check if there are more posts on the server

    const observer = useRef(); // For IntersectionObserver
    const lastPostElementRef = useCallback(node => {
        if (isFetchingMore) return; // Don't observe if already fetching

        if (observer.current) observer.current.disconnect(); // Disconnect previous observer

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                // If the last element is visible and there are more posts, load more
                setCurrentPage(prevPage => prevPage + 1);
            }
        }, { threshold: 0.1 }); // Trigger when 10% of the element is visible

        if (node) observer.current.observe(node); // Observe the new last post
    }, [isFetchingMore, hasMore]); // Re-create observer if fetching state or hasMore changes

    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    // Function to fetch posts with pagination
    const fetchPosts = useCallback(async (page, limit) => {
        setIsFetchingMore(true); // Indicate that we are fetching more data
        try {
            const token = localStorage.getItem("jwt");
            if (!token) {
                navigate("/signup");
                return;
            }

            const response = await fetch(`http://localhost:5000/allposts?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: "Bearer " + token,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    navigate("/signup");
                    notifyA("Session expired. Please log in again.");
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // Update data state: if it's the first page, replace; otherwise, append
            if (page === 0) {
                setData(result);
            } else {
                setData(prevData => [...prevData, ...result]);
            }

            // Check if there are more posts to load (if fetched less than limit)
            setHasMore(result.length === limit);

        } catch (err) {
            console.error("Failed to fetch posts:", err);
            notifyA("Failed to fetch posts. Please try again.");
            setHasMore(false); // Stop trying to load more if there's an error
        } finally {
            setIsLoadingPosts(false); // Initial loading is done
            setIsFetchingMore(false); // Finished fetching
        }
    }, [navigate]);

    // Initial fetch of posts on component mount
    useEffect(() => {
        fetchPosts(0, 5); // Fetch first 5 posts
    }, [fetchPosts]);

    // Fetch more posts when currentPage changes (triggered by IntersectionObserver)
    useEffect(() => {
        if (currentPage > 0) {
            fetchPosts(currentPage, 5); // Fetch next 5 posts
        }
    }, [currentPage, fetchPosts]);


    const toggleCommentModal = (posts) => {
        if (showCommentModal) {
            setShowCommentModal(false);
            setCurrentItem(null); // Clear item when closing
            setCommentText(""); // Clear comment input
        } else {
            setShowCommentModal(true);
            setCurrentItem(posts);
        }
    };

    const likePost = (id) => {
        fetch("http://localhost:5000/like", {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                postId: id,
            }),
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((result) => {
            const newData = data.map((post) => {
                if (post._id === result._id) {
                    return result;
                } else {
                    return post;
                }
            });
            setData(newData);
            if (showCommentModal && currentItem && currentItem._id === result._id) {
                setCurrentItem(result);
            }
            notifyB("Post liked!");
        })
        .catch((err) => {
            console.log(err);
            notifyA("Failed to like post.");
        });
    };

    const unlikePost = (id) => {
        fetch("http://localhost:5000/unlike", {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                postId: id,
            }),
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((result) => {
            const newData = data.map((post) => {
                if (post._id === result._id) {
                    return result;
                } else {
                    return post;
                }
            });
            setData(newData);
            if (showCommentModal && currentItem && currentItem._id === result._id) {
                setCurrentItem(result);
            }
            notifyB("Post unliked!");
        })
        .catch((err) => {
            console.log(err);
            notifyA("Failed to unlike post.");
        });
    };

    const makeComment = (text, id) => {
        fetch("http://localhost:5000/comment", {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify({
                text: text,
                postId: id,
            }),
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((result) => {
            const newData = data.map((post) => {
                if (post._id === result._id) {
                    return result;
                } else {
                    return post;
                }
            });
            setData(newData);
            setCommentText(""); // Clear comment input
            notifyB("Comment posted");
            if (showCommentModal && currentItem && currentItem._id === result._id) {
                setCurrentItem(result); // Update current item in modal
            }
        })
        .catch((err) => {
            console.log(err);
            notifyA("Failed to post comment.");
        });
    };

    // Function to delete post
    const deletePost = (postId) => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            fetch(`http://localhost:5000/deletePost/${postId}`, {
                method: "delete",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(result => {
                console.log(result);
                notifyB("Post deleted successfully!");
                // Filter out the deleted post from the data state
                const newData = data.filter(post => post._id !== result._id);
                setData(newData);
                if (showCommentModal && currentItem && currentItem._id === postId) {
                    toggleCommentModal(); // Close modal if deleted post was open
                }
            })
            .catch(err => {
                console.log(err);
                notifyA("Failed to delete post.");
            });
        }
    };

    const user = JSON.parse(localStorage.getItem("user")); // Get current user for ID comparison

    return (
        <div className="home-page-container">
            {/* Page Header with "Add News" button */}
            <div className="home-header">
                <h2 className="home-title">Latest Posts</h2>
                <button className="add-news-btn" onClick={() => setIsCreateModalOpen(true)}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Create Post
                </button>
            </div>

            {isLoadingPosts && data.length === 0 ? ( // Show initial loading only if no data yet
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading posts...</p>
                </div>
            ) : data.length === 0 ? ( // Show no posts message if no data after loading
                <div className="no-posts-message">
                    <p>No posts available. Be the first to share something!</p>
                </div>
            ) : (
                <div className="home"> {/* Main container for posts */}
                    {data.map((posts, index) => {
                        // Attach ref to the last element for infinite scroll
                        const isLastPost = index === data.length - 1;
                        return (
                            <div className="card" key={posts._id} ref={isLastPost ? lastPostElementRef : null}>
                                <div className="card-header">
                                    <div className="card-pic">
                                        <img
                                            src={posts.postedBy.Photo ? posts.postedBy.Photo : picLink}
                                            alt="Profile"
                                        />
                                    </div>
                                    <h5 className="card-username">
                                        <Link to={`/profile/${posts.postedBy._id}`}>
                                            {posts.postedBy.name}
                                        </Link>
                                    </h5>
                                    {/* Delete post button (only for current user's posts) */}
                                    {posts.postedBy._id === user._id && (
                                        <span
                                            className="material-symbols-outlined delete-icon"
                                            onClick={() => deletePost(posts._id)}
                                        >
                                            delete
                                        </span>
                                    )}
                                </div>
                                <div className="card-image">
                                    <img src={posts.photo} alt="Post" />
                                </div>

                                <div className="card-content">
                                    <div className="card-actions">
                                        {posts.likes.includes(user._id) ? (
                                            <span
                                                className="material-symbols-outlined liked"
                                                onClick={() => unlikePost(posts._id)}
                                            >
                                                favorite
                                            </span>
                                        ) : (
                                            <span
                                                className="material-symbols-outlined"
                                                onClick={() => likePost(posts._id)}
                                            >
                                                favorite
                                            </span>
                                        )}
                                        <span
                                            className="material-symbols-outlined comment-icon"
                                            onClick={() => toggleCommentModal(posts)}
                                        >
                                            chat_bubble
                                        </span>
                                    </div>
                                    <p className="likes-count">{posts.likes.length} Likes</p>
                                    <p className="card-body-text">
                                        <span className="caption-username">{posts.postedBy.name}</span>{" "}
                                        {posts.body}
                                    </p>
                                    {posts.sports && <p className="post-sport">Sport: <strong>{posts.sports}</strong></p>}

                                    {posts.comments.length > 0 && (
                                        <p
                                            style={{ fontWeight: "bold", cursor: "pointer" }}
                                            onClick={() => toggleCommentModal(posts)}
                                            className="view-comments-link"
                                        >
                                            View all {posts.comments.length} comments
                                        </p>
                                    )}
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
                                                    makeComment(commentText, posts._id);
                                                } else {
                                                    notifyA("Comment cannot be empty.");
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        className="comment-btn"
                                        onClick={() => {
                                            if (commentText.trim()) {
                                                makeComment(commentText, posts._id);
                                            } else {
                                                notifyA("Comment cannot be empty.");
                                            }
                                        }}
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {isFetchingMore && hasMore && (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading more posts...</p>
                        </div>
                    )}
                    {!hasMore && data.length > 0 && ( // Show "End of Feed" only if posts were loaded
                        <div className="end-of-feed">
                            <p>You've reached the end of the feed!</p>
                        </div>
                    )}
                </div>
            )}


            {/* Render CreatePostModal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPostSuccess={() => {
                    // When a post is successfully created, reset the feed to the first page
                    // and re-fetch to include the new post at the top.
                    setCurrentPage(0);
                    setData([]); // Clear existing data to force re-fetch from scratch
                    setIsLoadingPosts(true); // Indicate loading
                    setHasMore(true); // Assume there's more to fetch
                    // fetchAllPosts will be called by useEffect after currentPage resets
                }}
            />

            {/* Render CommentModal */}
            {showCommentModal && currentItem && ( // Ensure currentItem is not null
                <CommentModal
                    item={currentItem}
                    picLink={picLink}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    makeComment={makeComment}
                    toggleCommentModal={toggleCommentModal}
                    likePost={likePost}
                    unlikePost={unlikePost}
                    currentUser={user}
                    deletePost={deletePost}
                />
            )}
        </div>
    );
}