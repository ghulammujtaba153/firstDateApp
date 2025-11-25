import React from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaGlobe,
  FaHeadphones,
  FaLock,
  FaMobile,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const HelpSection = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="max-w-[300px] w-full p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-lg font-bold mb-4">Help & Support</h1>

        <Link to="/dashboard/support" className="bg-gray-50 rounded-lg flex items-center gap-2 p-2 mb-2">
          <FaHeadphones className="text-primary" />
          <h2>Contact Support</h2>
        </Link>
        <Link to="/" className="bg-gray-50 rounded-lg flex items-center gap-2 p-2 mb-2">
          <FaGlobe className="text-primary" />
          <h2>Website</h2>
        </Link>

      </div>

      <div className="max-w-[300px] flex items-center justify-between w-full p-6 bg-white shadow-lg rounded-2xl">
        <Link to="/dashboard/privacy-policy" className="flex items-center gap-4">
          <FaLock className="text-primary" />
          <h2>Privacy & Securityt</h2>
        </Link>

        <FaArrowRight className="text-gray-400" />
      </div>
    </div>
  );
};

export default HelpSection;
