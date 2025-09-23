import React from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaGlobe,
  FaHeadphones,
  FaLock,
  FaMobile,
} from "react-icons/fa";

const HelpSection = () => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="max-w-[300px] w-full p-6 bg-white shadow-lg rounded-2xl">
        <h1 className="text-lg font-bold mb-4">Help & Support</h1>

        <div className="bg-gray-50 rounded-lg flex items-center gap-2 p-2 mb-2">
          <FaHeadphones className="text-primary" />
          <h2>Contact Support</h2>
        </div>
        <div className="bg-gray-50 rounded-lg flex items-center gap-2 p-2 mb-2">
          <FaGlobe className="text-primary" />
          <h2>Website</h2>
        </div>
        <div className="bg-gray-50 rounded-lg flex items-center gap-2 p-2 mb-2">
          <FaMobile className="text-primary" />
          <h2>Whatsapp</h2>
        </div>
      </div>

      <div className="max-w-[300px] flex items-center justify-between w-full p-6 bg-white shadow-lg rounded-2xl">
        <div className="flex items-center gap-4">
          <FaLock className="text-primary" />
          <h2>Privacy & Securityt</h2>
        </div>

        <FaArrowRight className="text-gray-400" />
      </div>
    </div>
  );
};

export default HelpSection;
