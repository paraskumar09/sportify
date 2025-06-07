import React, { useState, useEffect } from "react";
import "./Createpost.css"; // Ensure this is linked
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export default function Createpost() {
    const [body, setBody] = useState(""); // State for the caption/body
    const [image, setImage] = useState(null);
    const [url, setUrl] = useState("");
    const [sports, setSports] = useState("");
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Toast functions
    const notifyA = (msg) => toast.error(msg);
    const notifyB = (msg) => toast.success(msg);

    useEffect(() => {
        // Fetch user data on component mount
        fetch(`http://localhost:5000/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
        })
        .then((res) => res.json())
        .then((result) => {
            console.log(result);
            setUser(result.user);
            setSports(result.user.Sports || "General"); // Set default sport from user profile
        })
        .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        // This effect runs when 'url' state changes (i.e., after image is uploaded to Cloudinary)
        if (url) {
            fetch("http://localhost:5000/createPost", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({
                    body, // The caption/body of the post
                    sports,
                    pic: url
                })
            }).then(res => res.json())
            .then(data => {
                setLoading(false); // Stop loading regardless of success/error
                if (data.error) {
                    notifyA(data.error);
                } else {
                    notifyB("Successfully Posted");
                    navigate("/"); // Navigate to home page after successful post
                }
            })
            .catch(err => {
                console.log(err);
                notifyA("Post creation failed.");
                setLoading(false); // Stop loading on network error
            });
        }
    }, [url, body, sports, navigate]); // Add dependencies for useEffect

    // Function to handle post creation (image upload then data saving)
    const postDetails = () => {
        if (!image) {
            notifyA("Please select an image to post.");
            return;
        }
        if (!body.trim()) { // Check for empty or just whitespace caption
            notifyA("Please add a caption for your post.");
            return;
        }

        setLoading(true); // Start loading indicator

        const data = new FormData();
        data.append("file", image);
        data.append("upload_preset", "insta-clone"); // Your Cloudinary upload preset
        data.append("cloud_name", "cantacloud2"); // Your Cloudinary cloud name

        fetch("https://api.cloudinary.com/v1_1/cantacloud2/image/upload", {
            method: "post",
            body: data
        }).then(res => res.json())
        .then(data => {
            setUrl(data.url); // Set the URL, which triggers the second useEffect
        })
        .catch(err => {
            console.log(err);
            notifyA("Image upload to Cloudinary failed.");
            setLoading(false); // Stop loading on image upload error
        });
    };

    // Function to handle file input change and image preview
    const loadfile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file); // Set the image file
            const output = document.getElementById("output");
            output.src = URL.createObjectURL(file); // Create object URL for preview
            output.onload = function () {
                URL.revokeObjectURL(output.src); // Free memory after loading
            };
        } else {
            setImage(null); // Clear image if no file selected
            const output = document.getElementById("output");
            output.src = "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png"; // Reset to placeholder
        }
    };

    const placeholderImage = "https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png";
    const userProfilePic = user.Photo ? user.Photo : "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29ufGVufDB8MnwwfHw%3D&auto=format&fit=crop&w=500&q=60";

    const sportsOptions = [
        "General", "Football", "Basketball", "Tennis", "Cricket", "Badminton", "Volleyball", "Hockey", "Athletics", "Swimming", "Esports", "Other"
    ];

    return (
        <div className="createPost">
            {/* Header */}
            <div className="post-header">
                <h4>Create New Post</h4>
                <button
                    id="post-btn"
                    onClick={postDetails}
                    disabled={loading || !image || !body.trim()} // Disable if loading, no image, or empty caption
                >
                    {loading ? "Sharing..." : "Share"}
                </button>
            </div>

            {/* Image Preview & Upload Area */}
            <div className="main-div">
                <div className="image-upload-area">
                    <img
                        id="output"
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
            <div className="details">
                <div className="card-header">
                    <div className="card-pic">
                        <img
                            src={userProfilePic}
                            alt="User Profile"
                        />
                    </div>
                    <h5>{user.name}</h5>
                </div>

                {/* Caption Textarea - RE-ADDED */}
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a caption..."
                ></textarea>

                {/* Sports Select Field */}
                <div className="form-group">
                    <label htmlFor="postSports">Select Sport (Optional)</label>
                    <select
                        id="postSports"
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
    );
}