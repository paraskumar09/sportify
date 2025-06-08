import React, { useContext } from "react";
import logo from "../img/logo.png"; // Assuming logo.png is dark-theme friendly or will be replaced
import { Link, useNavigate } from "react-router-dom"; // Corrected useNavigate import
import { LoginContext } from "../context/LoginContext";
import './Navbar.css'; // Import the updated CSS

export default function Navbar({ login }) {
  const { setModalOpen } = useContext(LoginContext);
  const navigate = useNavigate(); // Correct usage of useNavigate hook

  // Helper function to render navigation links based on login status
  const loginStatus = () => {
    const token = localStorage.getItem("jwt"); // Check for JWT token in local storage
    if (login || token) {
      // User is logged in
      return (
        <>
          {/* Home Icon */}
          <Link to="/" className="nav-item">
            <i className="fa-solid fa-house"></i>
          </Link>
          {/* Search Icon */}
          <Link to="/searchUser" className="nav-item">
            <i className="fa-solid fa-magnifying-glass"></i>
          </Link>
          {/* News Icon */}
          <Link to="/trending" className="nav-item">
            <i className="fa-solid fa-newspaper"></i>
          </Link>
          {/* Profile Icon */}
          <Link to="/profile" className="nav-item">
            <i className="fa-solid fa-user"></i>
          </Link>
          {/* My Following Link */}
          <Link to="/followingpost" className="nav-item text-link">
            My Following
          </Link>
          {/* Log Out Button - opens modal */}
          <button className="primaryBtn logout-btn" onClick={() => setModalOpen(true)}>
            Log Out
          </button>
        </>
      );
    } else {
      // User is not logged in
      return (
        <>
          {/* Sign Up Link */}
          <Link to="/signup" className="nav-item text-link">
            SignUp
          </Link>
          {/* Sign In Link */}
          <Link to="/signin" className="nav-item text-link">
            SignIn
          </Link>
        </>
      );
    }
  };

  return (
    <div className="navbar">
      {/* Logo Link to Home */}
      <Link to="/">
        <img src={logo} alt="Logo" className="navbar-logo" />
      </Link>
      {/* Navigation Menu */}
      <ul className="nav-menu">
        {loginStatus()}
      </ul>
    </div>
  );
}
