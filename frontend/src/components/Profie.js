import React, { useEffect, useState } from "react";
import PostDetail from "./PostDetail";
import "./Profile.css"; // Ensure this is linked
import ProfilePic from "./ProfilePic";

export default function Profile() {
    var picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
    const [pic, setPic] = useState([]);
    const [show, setShow] = useState(false);
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState({}); // Initialize as an object for user data
    const [changePic, setChangePic] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false); // State for Edit Profile modal

    // State for edit form inputs
    const [editName, setEditName] = useState("");
    const [editUserName, setEditUserName] = useState("");
    const [editSelectedSport, setEditSelectedSport] = useState("");

    const sportsOptions = [
        "General", "Football", "Basketball", "Tennis", "Cricket", "Badminton", "Volleyball", "Hockey", "Athletics", "Swimming", "Esports", "Other"
    ];

    const toggleDetails = (posts) => {
        if (show) {
            setShow(false);
        } else {
            setShow(true);
            setPosts(posts);
        }
    };

    const changeprofile = () => {
        setChangePic(!changePic);
    };

    const toggleEditProfileModal = () => {
        if (!showEditProfileModal) {
            // When opening the modal, pre-fill the form with current user data
            setEditName(user.name || "");
            setEditUserName(user.userName || "");
            setEditSelectedSport(user.Sports || "");
        }
        setShowEditProfileModal(!showEditProfileModal);
    };

    const handleProfileUpdate = () => {
        const updatedData = {
            name: editName,
            userName: editUserName,
            Sports: editSelectedSport,
        };

        fetch("http://localhost:5000/updateuser", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
            body: JSON.stringify(updatedData),
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log("Profile updated:", data);
                // Update localStorage
                const updatedUserInStorage = {
                    ...JSON.parse(localStorage.getItem("user")),
                    name: data.name,
                    userName: data.userName,
                    Sports: data.Sports
                };
                localStorage.setItem("user", JSON.stringify(updatedUserInStorage));

                // Update component state
                setUser(data);
                toggleEditProfileModal(); // Close the modal
            }
        })
        .catch(err => {
            console.log(err);
            alert("Failed to update profile.");
        });
    };

    useEffect(() => {
        fetch(`http://localhost:5000/user/${JSON.parse(localStorage.getItem("user"))._id}`, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
        })
        .then((res) => res.json())
        .then((result) => {
            console.log(result);
            setPic(result.post);
            setUser(result.user);
        })
        .catch(err => console.log(err));
    }, []);

    return (
        <div className="profile">
            {/* Profile frame */}
            <div className="profile-frame">
                {/* profile-pic */}
                <div className="profile-pic">
                    <img
                        onClick={changeprofile}
                        src={user.Photo ? user.Photo : picLink}
                        alt="Profile"
                    />
                </div>
                {/* profile-data - Fixed typo from pofile-data to profile-data */}
                <div className="profile-data">
                    <h1>{user.name}</h1>
                    <p>@{user.userName}</p>
                    <div className="profile-info"> {/* Removed inline style */}
                        <p><strong>{pic ? pic.length : "0"}</strong> posts</p>
                        <p><strong>{user.followers ? user.followers.length : "0"}</strong> followers</p>
                        <p><strong>{user.following ? user.following.length : "0"}</strong> following</p>
                        <p>Sports: <strong>{user.Sports || "Not specified"}</strong></p>
                    </div>
                    <button className="edit-profile-button" onClick={toggleEditProfileModal}>
                        Edit Profile
                    </button>
                </div>
            </div>
            <hr
                style={{
                    width: "90%",
                    opacity: "0.8",
                    margin: "25px auto",
                }}
            />
            {/* Gallery */}
            <div className="gallery">
                {pic.length > 0 ? (
                    pic.map((pics) => {
                        return <img key={pics._id} src={pics.photo}
                            onClick={() => {
                                toggleDetails(pics)
                            }}
                            className="item" alt="Post"></img>;
                    })
                ) : (
                    <div className="no-posts">
                        <p>No posts yet. Start sharing your moments!</p> {/* Enhanced message */}
                    </div>
                )}
            </div>
            {show &&
                <PostDetail item={posts} toggleDetails={toggleDetails} />
            }
            {
                changePic &&
                <ProfilePic changeprofile={changeprofile} />
            }

            {/* Edit Profile Modal */}
            {showEditProfileModal && (
                <div className="news-modal-backdrop">
                    <div className="news-modal-content">
                        <div className="news-modal-header">
                            <h3>Edit Profile</h3>
                            <span className="material-symbols-outlined close-icon" onClick={toggleEditProfileModal}>
                                close
                            </span>
                        </div>
                        <div className="news-modal-body">
                            <div className="form-group">
                                <label htmlFor="editName">Name</label>
                                <input
                                    type="text"
                                    id="editName"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="sports-select"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editUserName">Username</label>
                                <input
                                    type="text"
                                    id="editUserName"
                                    value={editUserName}
                                    onChange={(e) => setEditUserName(e.target.value)}
                                    className="sports-select"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editSports">Favorite Sport</label>
                                <select
                                    id="editSports"
                                    value={editSelectedSport}
                                    onChange={(e) => setEditSelectedSport(e.target.value)}
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
                        <div className="modal-footer-news">
                            <button className="cancel-btn" onClick={toggleEditProfileModal}>
                                Cancel
                            </button>
                            <button className="post-news-btn" onClick={handleProfileUpdate}>
                                Update Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}