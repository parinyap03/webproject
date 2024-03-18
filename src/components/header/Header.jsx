import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext/AuthContext";
import { doSignOut } from "../../firebase/auth";
import logo from "../../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus,
  faSignInAlt,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  return (
    <nav className="flex flex-row justify-between w-full z-20 fixed top-0 left-0 h-16 border-b items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white">
      <img src={logo} alt="Logo" className="h-10 m-5" />
      {userLoggedIn ? (
        <button
          onClick={() => {
            doSignOut().then(() => {
              navigate("/login");
            });
          }}
          className="text-sm m-5"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      ) : (
        <div>
          <Link className="text-sm" to={"/login"}>
            <FontAwesomeIcon icon={faSignInAlt} /> Login
          </Link>
          <Link className="text-sm ml-8 mr-8" to={"/register"}>
            <FontAwesomeIcon icon={faUserPlus} /> Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Header;
