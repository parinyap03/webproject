import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext/AuthContext";
import { doSignOut } from "../../firebase/auth";
// import logo from "../../assets/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();
  return (
    <nav className="flex flex-row justify-between w-full z-20 fixed top-0 left-0 h-16 border-b items-center bg-white">
      {/* <img src={logo} alt="Logo" className="h-10 m-5" /> */}
      {userLoggedIn ? (
        <button
          onClick={() => {
            doSignOut().then(() => {
              navigate("/login");
              localStorage.removeItem('checkInId');
            });
          }}
          className="text-sm ml-20 p-5 right-20 font-semibold hover:bg-gray-500 hover:text-white"
        >
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      ) : (
        <div>
          
        </div>
      )}
    </nav>
  );
};

export default Header;
