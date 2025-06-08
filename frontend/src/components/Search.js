import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import './Search.css'; 

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [item, setItem] = useState([]);
  const [comment, setComment] = useState("");
  const [userSports, setUserSports] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  
  // Toast notifications
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);
  
  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Fetch user data and initial posts
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup");
      return;
    }

    // Get user data to determine sports preference
    const userId = JSON.parse(localStorage.getItem("user"))._id;
    
    fetch(`http://localhost:5000/user/${userId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.user) {
          const userSportsPref = result.user.Sports || "General";
          console.log("User sports preference:", userSportsPref);
          setUserSports(userSportsPref);
          
          // Now fetch posts based on user's sports preference
          fetchInitialPosts(userSportsPref);
        } else {
          // Fallback to all posts
          setUserSports("General");
          fetchInitialPosts("General");
        }
      })
      .catch((err) => {
        console.log(err);
        // Fallback to all posts on error
        setUserSports("General");
        fetchInitialPosts("General");
      });
  }, [navigate]);

  // Function to fetch initial posts based on user's sports preference
  const fetchInitialPosts = (sportsPref) => {
    setIsLoading(true);
    
    // If sports preference is General or not specified, fetch all posts
    // Otherwise, fetch posts matching the user's sports preference
    const url = sportsPref === "General" 
      ? "http://localhost:5000/allposts"
      : `http://localhost:5000/sportsposts/${sportsPref}`;
    
    fetch(url, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log("Initial posts:", result);
        setData(result);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  // Effect to handle search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // If search bar is cleared, revert to showing posts based on user's sports preference
      fetchInitialPosts(userSports);
      return;
    }
    
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      
      fetch(`http://localhost:5000/search?userName=${searchTerm}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log("Search results:", result);
          setData(result);
          setIsLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsLoading(false);
        });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, userSports]);

  const toggleComment = (posts) => {
    if (show) {
      setShow(false);
    } else {
      setShow(true);
      setItem(posts);
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
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          } else {
            return posts;
          }
        });
        setData(newData);
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
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          } else {
            return posts;
          }
        });
        setData(newData);
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
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((posts) => {
          if (posts._id == result._id) {
            return result;
          } else {
            return posts;
          }
        });
        setData(newData);
        setComment("");
        notifyB("Comment posted");
      });
  };

  return (
    <div className="search-container">
      <div className="search-bar-container">
        <div className="search-bar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search users"
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        {userSports && userSports !== "General" && (
          <div className="current-filter">
            <span>Showing posts for: </span>
            <span className="filter-tag">{userSports}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading posts...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="no-posts-message">
          <p>No posts found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {data.map((posts) => {
            return (
              <div className="card" key={posts._id}>
                <div className="card-header">
                  <div className="card-pic">
                    <img
                      src={posts.postedBy.Photo ? posts.postedBy.Photo : picLink}
                      alt="Profile"
                    />
                  </div>
                  <h5>
                    <Link to={`/profile/${posts.postedBy._id}`}>
                      {posts.postedBy.name}
                    </Link>
                  </h5>
                  {posts.Sports && (
                    <span className="post-sport-tag">{posts.Sports}</span>
                  )}
                </div>
                <div className="card-image">
                  <img src={posts.photo} alt="Post" />
                </div>

                <div className="card-content">
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {posts.likes.includes(
                      JSON.parse(localStorage.getItem("user"))._id
                    ) ? (
                      <span
                        className="material-symbols-outlined material-symbols-outlined-red"
                        onClick={() => {
                          unlikePost(posts._id);
                        }}
                      >
                        favorite
                      </span>
                    ) : (
                      <span
                        className="material-symbols-outlined"
                        onClick={() => {
                          likePost(posts._id);
                        }}
                      >
                        favorite
                      </span>
                    )}

                    <p>{posts.likes.length} Likes</p>
                  </div>
                  <p className="card-body-text">{posts.body}</p>
                  <p
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => {
                      toggleComment(posts);
                    }}
                  >
                    View all {posts.comments.length} comments
                  </p>
                </div>

                <div className="add-comment">
                  <span className="material-symbols-outlined">mood</span>
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                    }}
                  />
                  <button
                    className="comment-btn"
                    onClick={() => {
                      makeComment(comment, posts._id);
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {show && (
        <div className="showComment">
          <div className="container">
            <div className="postPic">
              <img src={item.photo} alt="Post" />
            </div>
            <div className="details">
              <div
                className="card-header"
                style={{ borderBottom: "1px solid #00000029" }}
              >
                <div className="card-pic">
                  <img
                    src={item.postedBy.Photo ? item.postedBy.Photo : picLink}
                    alt="Profile"
                  />
                </div>
                <h5>{item.postedBy.name}</h5>
              </div>

              <div
                className="comment-section"
                style={{ borderBottom: "1px solid #00000029" }}
              >
                {item.comments.map((val) => {
                  return (
                    <p className="comm" key={val._id || Math.random()}>
                      <span
                        className="commenter"
                        style={{ fontWeight: "bolder" }}
                      >
                        {val.postedBy.name}{" "}
                      </span>
                      <span className="commentText">{val.comment}</span>
                    </p>
                  );
                })}
              </div>

              <div className="card-content">
                <p>{item.likes.length} Likes</p>
                <p className="card-body-text">{item.body}</p>
              </div>

              <div className="add-comment">
                <span className="material-symbols-outlined">mood</span>
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                  }}
                />
                <button
                  className="comment-btn"
                  onClick={() => {
                    makeComment(comment, item._id);
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
          <div
            className="close-comment"
            onClick={() => {
              toggleComment();
            }}
          >
            <span className="material-symbols-outlined material-symbols-outlined-comment">
              close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
