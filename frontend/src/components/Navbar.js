import React, { useContext } from "react";
import logo from "../img/logo.png";
import "./Navbar.css";
import { Link ,useNavigate} from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

export default function Navbar({ login }) {
  const { setModalOpen } = useContext(LoginContext);
  const {navigate}= useNavigate();
  const loginStatus = () => {
    const token = localStorage.getItem("jwt");
    if (login || token) {
      return [
        <>
         <Link to="/">
            <li><i class="fa-solid fa-house"></i></li>
          </Link>
          <Link to="/searchUser">
          <li><i class="fa-solid fa-magnifying-glass"></i></li>
          </Link>
          <Link to="/trending">
            <i class="fa-solid fa-newspaper"></i>
          </Link>
          <Link to="/profile">
            <li><i class="fa-solid fa-user"></i></li>
          </Link>
          <Link to="/createPost"><i class="fa-solid fa-plus"></i></Link>
          <Link style={{ marginLeft: "20px" }} to="/followingpost">
            My Following
          </Link>
          <Link to={""}>
            <button className="primaryBtn" onClick={() => setModalOpen(true)}>
              Log Out
            </button>
          </Link>
        </>,
      ];
    } else {
      return [
        <>
          <Link to="/signup">
            <li>SignUp</li>
          </Link>
          <Link to="/signin">
            <li>SignIn</li>
          </Link>
        </>,
      ];
    }
  };

  return (
    <div className="navbar">
      <Link to="/"><img src={logo} alt="" /></Link>
      <ul className="nav-menu">{loginStatus()}</ul>
    </div>
  );
}
