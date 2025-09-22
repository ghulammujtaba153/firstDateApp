import React, { useState } from "react";
import { FaSearch, FaBell, FaCommentDots, FaUser, FaSignOutAlt } from "react-icons/fa";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="w-full h-16 bg-white shadow flex items-center justify-between px-6 relative">
      {/* Left: Search bar */}
      <div className="flex items-center w-1/3">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right: Icons + Avatar */}
      <div className="flex items-center space-x-6">

        <button className="text-primary  rounded-lg p-1">
          <FaBell size={20} />
        </button>
        
        <button className="text-primary  rounded-lg p-1">
          <FaCommentDots size={20}  />
        </button>


        <div className="h-10 w-px bg-gray-900"></div>


        {/* Profile Dropdown */}
        <div className="relative">
          <img
            src="https://via.placeholder.com/40"
            alt="profile"
            className="rounded-full w-10 h-10 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
              <p className="px-4 py-2 text-gray-700 font-semibold">Hello, User</p>
              <hr />
              <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-600">
                <FaUser /> Profile
              </button>
              <button className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-600">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
