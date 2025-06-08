import React, { useState, useEffect } from "react";
import "./CreatePostModal.css"; // We'll create this CSS
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

// Props: isOpen, onClose, onPostSuccess
export default function CreatePostModal({ isOpen, onClose, onPostSuccess }) {
    const [body, setBody] = useState("");
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
    const [sports, setSports] = useState("");
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false); // For post submission
    const [imageLoading, setImageLoading] = useState(false); // For image upload

    const navigate = useNavigate();

    // Toast functions
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    // Reset form state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            // Reset all states when modal is closed
            setBody("");
            setImage(null);
            setUrl("");
            setSports(""); // Reset to default if needed, or keep user's default sport
            setLoading(false);
            setImageLoading(false);
            // Reset image preview
            const output = document.getElementById("modalOutput");
            if (output) {
                output.src = "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png";
            }
        }
    }, [isOpen]);

    // Fetch user data on component mount (or when modal becomes open)
    useEffect(() => {
        if (isOpen) { // Only fetch user data when modal is open
            fetch(`http://localhost:5000/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("jwt"),
                },
            })
            .then((res) => res.json())
            .then((result) => {
                setUser(result.user);
                setSports(result.user.Sports || "General");
            })
            .catch(err => console.log(err));
        }
    }, [isOpen]); // Depend on isOpen

    // Effect for saving post to MongoDB after image upload
    useEffect(() => {
        if (url) {
            fetch("http://localhost:5000/createPost", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({
                    body,
                    sports,
                    pic: url
                })
            }).then(res => res.json())
            .then(data => {
                setLoading(false);
                if (data.error) {
                    notifyA(data.error);
                } else {
                    notifyB("Successfully Posted");
                    onClose(); // Close modal on success
                    if (onPostSuccess) {
                        onPostSuccess(); // Callback to refresh posts on Home page
                    }
                }
            })
            .catch(err => {
                console.log(err);
                notifyA("Post creation failed.");
                setLoading(false);
            });
        }
    }, [url, body, sports, onClose, onPostSuccess]);

    // Function to handle image upload to Cloudinary
    const postDetails = () => {
        if (!image) {
            notifyA("Please select an image to post.");
            return;
        }
        if (!body.trim()) {
            notifyA("Please add a caption for your post.");
            return;
        }

        setLoading(true); // Start loading for the overall post submission
        setImageLoading(true); // Indicate image upload is in progress

        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "insta-clone"); // Replace with your actual preset
        data.append("cloud_name", "cantacloud2"); // Replace with your actual cloud name

        fetch("https://api.cloudinary.com/v1_1/cantacloud2/image/upload", {
            method: "post",
            body: data
        }).then(res => res.json())
        .then(data => {
            setUrl(data.url);
            setImageLoading(false); // Image upload complete
        })
        .catch(err => {
            console.log(err);
            notifyA("Image upload to Cloudinary failed.");
            setImageLoading(false);
            setLoading(false); // Stop overall loading if image upload fails
        });
    };

    const loadfile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            const output = document.getElementById("modalOutput");
            if (output) { // Check if output element exists
                output.src = URL.createObjectURL(file);
                output.onload = function () {
                    URL.revokeObjectURL(output.src);
                };
            }
        } else {
            setImage(null);
            const output = document.getElementById("modalOutput");
            if (output) {
                output.src = "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png";
            }
        }
    };

    const placeholderImage = "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png";
    const userProfilePic = user.Photo ? user.Photo : "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29ufGVufDB8MnwwfHw%3D&auto=format&fit=crop&w=500&q=60";

    const sportsOptions = [
        "General", "Football", "Basketball", "Tennis", "Cricket", "Badminton", "Volleyball", "Hockey", "Athletics", "Swimming", "Esports", "Other"
    ];

    if (!isOpen) return null; // Don't render anything if modal is not open

    return (
        <div className="modal-overlay">
            <div className="createPostModal-content">
                {/* Header */}
                <div className="modal-header">
                    <h4>Create New Post</h4>
                    <button
                        id="modal-post-btn"
                        onClick={postDetails}
                        disabled={loading || imageLoading || !image || !body.trim()}
                    >
                        {loading ? "Sharing..." : imageLoading ? "Uploading Image..." : "Share"}
                    </button>
                    <span className="material-symbols-outlined modal-close-icon" onClick={onClose}>
                        close
                    </span>
                </div>

                {/* Image Preview & Upload Area */}
                <div className="modal-main-div">
                    <div className="modal-image-upload-area">
                        <img
                            id="modalOutput" // Unique ID for modal's image preview
                            src={image ? URL.createObjectURL(image) : placeholderImage}
                            alt="Upload Preview"
                        />
                        {!image && <p>Click to select an image</p>}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={loadfile}
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="modal-details">
                    <div className="card-header">
                        <div className="card-pic">
                            <img
                                src={userProfilePic}
                                alt="User Profile"
                            />
                        </div>
                        <h5>{user.name}</h5>
                    </div>

                    {/* Caption Textarea */}
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write a caption..."
                    ></textarea>

                    {/* Sports Select Field */}
                    <div className="form-group">
                        <label htmlFor="modalPostSports">Select Sport (Optional)</label>
                        <select
                            id="modalPostSports" // Unique ID for modal's select
                            value={sports}
                            onChange={(e) => setSports(e.target.value)}
                            className="sports-select"
                        >
                            {sportsOptions.map((sport) => (
                                <option key={sport} value={sport}>
                                    {sport}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}