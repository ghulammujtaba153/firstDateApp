import React from "react";
import { Link } from "react-router-dom";

const Notification = ({ title, message, link, linkText, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-8 rounded-[20px] shadow-lg text-center w-[350px] relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-800 hover:text-gray-900"
        >
          ✕
        </button>

        {/* Icon */}
        <img src="/check.png" alt="logo" className="w-20 h-20 mx-auto" />

        {/* Title */}
        <h1 className="text-2xl font-bold mt-4">{title}</h1>

        {/* Message */}
        <p className="text-gray-500 mt-2">{message}</p>

        {/* Action Link */}
        <Link
          to={link}
          className="inline-block w-full bg-primary text-white px-6 py-3 rounded-full mt-6 hover:opacity-90 transition"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
};

export default Notification;
