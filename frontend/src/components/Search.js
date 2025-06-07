import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import './Search.css'; 
import { use } from "react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    console.log('Search Term:', event.target.value);
  };


   var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [comment, setComment] = useState("");
    const [show, setShow] = useState(false);
    const [item, setItem] = useState([]);

  
    // Toast functions
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);
  
    useEffect(() => {
      const token = localStorage.getItem("jwt");
      if (!token) {
        navigate("./signup");
      }
  
      // Fetching all posts
      fetch(`http://localhost:5000/search?userName=${searchTerm}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(result);
          setData(result);
        })
        .catch((err) => console.log(err));
    }, [searchTerm]);
  
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
          console.log(result);
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
          console.log(result);
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
          console.log(result);
        });
    };

  return (
    <div className="search">
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
          placeholder="Search here"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

    <div className="home">
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
    </div>
  );
};

export default Search;