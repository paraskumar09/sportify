import React, { useEffect, useState } from "react";
import "./Trending.css"; // You'll need to create this CSS file
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";


const News = () => {
  const [newsContent, setNewsContent] = useState("");
  const [allNews, setAllNews] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null); // To display full news in a modal

  const navigate = useNavigate();

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  // Fetch all news from the server
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("/signup"); // Assuming you navigate to signup if not logged in
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
  }, []); // Empty dependency array to fetch news only once on component mount

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
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          notifyA(data.error);
        } else {
          notifyB("News posted successfully!");
          setAllNews([data.news, ...allNews]); // Add new news to the top
          setNewsContent(""); // Clear the input field
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
          setShowNewsModal(false); // Close modal if the deleted news was open
        }
      })
      .catch((err) => console.log(err));
  };

  const toggleNewsModal = (news) => {
    if (showNewsModal) {
      setShowNewsModal(false);
      setSelectedNews(null);
    } else {
      setShowNewsModal(true);
      setSelectedNews(news);
    }
  };

  var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png"

  return (
    <div className="news-section">
      <div className="post-news-container">
        <h3>Share the Latest News</h3>
        <textarea
          className="news-textarea"
          placeholder="What's happening?"
          value={newsContent}
          onChange={(e) => setNewsContent(e.target.value)}
        ></textarea>
        <button className="post-news-btn" onClick={postNews}>
          Post News
        </button>
      </div>

      <hr />

      <div className="all-news-container">
        <h2>Recent News</h2>
        {allNews.length === 0 ? (
          <p>No news available yet. Be the first to post!</p>
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
                <h5>
                  <Link to={`/profile/${news.postedBy._id}`}>
                    {news.postedBy.name}
                  </Link>
                </h5>
                {/* Optional: Add a delete button for news posted by the current user */}
                {news.postedBy._id === JSON.parse(localStorage.getItem("user"))._id && (
                  <span
                    className="material-symbols-outlined"
                    style={{ cursor: "pointer" }}
                    onClick={() => deleteNews(news._id)}
                  >
                    delete
                  </span>
                )}
              </div>
              <div className="news-card-content">
                <p className="news-body-text">{news.content.substring(0, 150)}...</p>
                <button className="read-more-btn" onClick={() => toggleNewsModal(news)}>Read More</button>
                <p className="news-timestamp">
                  Posted on: {new Date(news.createdAt).toLocaleDateString()} at{" "}
                  {new Date(news.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showNewsModal && selectedNews && (
        <div className="showNewsModal">
          <div className="modal-content-news">
            <div className="modal-header-news">
              <div className="news-card-pic">
                <img
                  src={selectedNews.postedBy.Photo ? selectedNews.postedBy.Photo : picLink}
                  alt="Profile"
                />
              </div>
              <h5>{selectedNews.postedBy.name}</h5>
              <span
                className="material-symbols-outlined close-modal-btn"
                onClick={toggleNewsModal}
              >
                close
              </span>
            </div>
            <div className="modal-body-news">
              <p>{selectedNews.content}</p>
              <p className="news-timestamp">
                Posted on: {new Date(selectedNews.createdAt).toLocaleDateString()} at{" "}
                {new Date(selectedNews.createdAt).toLocaleTimeString()}
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
    </div>
  );
};

export default News;