import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./News.css";

const News = () => {
  const navigate = useNavigate();
  const [allNews, setAllNews] = useState([]);
  const [newsContent, setNewsContent] = useState("");
  const [sportCategory, setSportCategory] = useState("");
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [userSports, setUserSports] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  // Fetch user data to get sports preference
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup");
      return;
    }

    const userId = JSON.parse(localStorage.getItem("user"))._id;
    
    fetch(`http://localhost:5000/user/${userId}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.user && result.user.Sports) {
          setUserSports(result.user.Sports);
          setSportCategory(result.user.Sports);
        }
      })
      .catch((err) => console.log(err));
  }, [navigate]);

  // Fetch all news from the server
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup");
      return;
    }

    fetch("http://localhost:5000/allnews", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        console.log(result);
        setAllNews(result);
      })
      .catch((err) => console.log(err));
  }, [navigate]);

  // Function to post news
  const postNews = () => {
    if (!newsContent) {
      notifyA("News content cannot be empty!");
      return;
    }

    fetch("http://localhost:5000/postnews", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        content: newsContent,
        sports: sportCategory || userSports || "General"
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notifyA(data.error);
        } else {
          notifyB(data.message);
          setAllNews([data.news, ...allNews]); // Add new news to the top
          setNewsContent(""); // Clear the input field
          setShowPostModal(false); // Close the post modal
        }
      })
      .catch((err) => console.log(err));
  };

  // Function to delete news
  const deleteNews = (newsId) => {
    fetch(`http://localhost:5000/deletenews/${newsId}`, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        notifyB(result.message);
        const newData = allNews.filter((news) => news._id !== result.deletedNews._id);
        setAllNews(newData);
        if (showNewsModal && selectedNews._id === newsId) {
          setShowNewsModal(false); // Close news detail modal if the deleted news was open
        }
      })
      .catch((err) => console.log(err));
  };

  const toggleNewsModal = (news) => {
    setShowNewsModal(!showNewsModal);
    setSelectedNews(news);
  };

  const togglePostModal = () => {
    setShowPostModal(!showPostModal);
  };

  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";

  // Sports categories
  const sportsCategories = [
    "General",
    "Football",
    "Basketball",
    "Cricket",
    "Tennis",
    "Baseball",
    "Golf",
    "Rugby",
    "Swimming",
    "Athletics"
  ];

  return (
    <div className="news-section">
      <div className="news-header">
        <h2>Sports News Feed</h2>
        <button className="post-news-btn" onClick={togglePostModal}>
          <span className="material-symbols-outlined">add</span> Post News
        </button>
      </div>

      <div className="all-news-container">
        {allNews.length === 0 ? (
          <div className="no-news">
            <p>No news available yet. Be the first to post!</p>
            <button className="post-news-btn" onClick={togglePostModal}>
              Post News
            </button>
          </div>
        ) : (
          allNews.map((news) => (
            <div className="news-card" key={news._id}>
              <div className="news-card-header">
                <div className="news-card-pic">
                  <img
                    src={news.postedBy.Photo ? news.postedBy.Photo : picLink}
                    alt="Profile"
                  />
                </div>
                <div className="news-card-info">
                  <h5>
                    <Link to={`/profile/${news.postedBy._id}`}>
                      {news.postedBy.name}
                    </Link>
                  </h5>
                  <span className="news-sport-tag">{news.Sports || "General"}</span>
                </div>
                {news.postedBy._id === JSON.parse(localStorage.getItem("user"))._id && (
                  <span
                    className="material-symbols-outlined delete-icon"
                    onClick={() => deleteNews(news._id)}
                  >
                    delete
                  </span>
                )}
              </div>
              <div 
                className="news-card-content" 
                onClick={() => toggleNewsModal(news)}
              >
                <p>{news.content}</p>
              </div>
              <div className="news-card-footer">
                <p className="news-timestamp">
                  {new Date(news.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* News Detail Modal */}
      {showNewsModal && selectedNews && (
        <div className="news-modal-backdrop" onClick={() => setShowNewsModal(false)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <div className="news-modal-user-info">
                <img
                  src={selectedNews.postedBy.Photo ? selectedNews.postedBy.Photo : picLink}
                  alt="Profile"
                />
                <div>
                  <h4>{selectedNews.postedBy.name}</h4>
                  <span className="news-sport-tag">{selectedNews.Sports || "General"}</span>
                </div>
              </div>
              <span 
                className="material-symbols-outlined close-icon" 
                onClick={() => setShowNewsModal(false)}
              >
                close
              </span>
            </div>
            <div className="news-modal-body">
              <p>{selectedNews.content}</p>
              <p className="news-timestamp">
                {new Date(selectedNews.createdAt).toLocaleString()}
              </p>
            </div>
            {selectedNews.postedBy._id === JSON.parse(localStorage.getItem("user"))._id && (
              <div className="modal-footer-news">
                <button className="delete-news-btn" onClick={() => deleteNews(selectedNews._id)}>Delete News</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Post News Modal */}
      {showPostModal && (
        <div className="news-modal-backdrop" onClick={() => setShowPostModal(false)}>
          <div className="news-modal-content post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <h3>Post News</h3>
              <span 
                className="material-symbols-outlined close-icon" 
                onClick={() => setShowPostModal(false)}
              >
                close
              </span>
            </div>
            <div className="news-modal-body">
              <div className="form-group">
                <label>Sports Category</label>
                <select 
                  value={sportCategory} 
                  onChange={(e) => setSportCategory(e.target.value)}
                  className="sports-select"
                >
                  {sportsCategories.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>News Content</label>
                <textarea
                  className="news-textarea"
                  placeholder="What's happening in sports?"
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer-news">
              <button className="cancel-btn" onClick={() => setShowPostModal(false)}>Cancel</button>
              <button className="post-news-btn" onClick={postNews}>Post News</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;
