import React from "react";

const Footer = () => {
  return (
<footer className="bg-gradient-to-r from-blue-200 to-blue-500 p-3 text-center text-black">
    <p className="text-xs font-bold">
        © {new Date().getFullYear()} All rights reserved.
    </p>
</footer>
  );
};

export default Footer;
