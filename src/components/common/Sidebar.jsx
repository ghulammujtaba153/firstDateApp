import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaCog,
  FaCalendarAlt,
  FaSignOutAlt,
  FaPhone,
  FaMoneyBillAlt,
} from "react-icons/fa";
import { TfiStar } from "react-icons/tfi";
import { MdOutlinePrivacyTip } from "react-icons/md";

const Sidebar = () => {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Chats", icon: <FaPhone />, path: "/dashboard/chats" },
    { name: "Matches", icon: <TfiStar />, path: "/dashboard/matches" },
    { name: "Events", icon: <FaCalendarAlt />, path: "/dashboard/events" },
    { name: "Subscriptions", icon: <FaMoneyBillAlt />, path: "/dashboard/subscriptions" },
    { name: "Profile", icon: <FaUser />, path: "/dashboard/profile" },
    { name: "Settings", icon: <FaCog />, path: "/dashboard/settings" },
    { name: "Privacy Policy", icon: <MdOutlinePrivacyTip />, path: "/dashboard/privacy-policy" },
    { name: "Logout", icon: <FaSignOutAlt />, path: "/logout" },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden p-3 fixed top-4 left-4 z-50 bg-primary text-white rounded-md"
        onClick={() => setOpen(!open)}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white text-[#646464] shadow-2xl transform transition-transform duration-300 z-40
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full overflow-y-auto p-6">
          {/* Logo */}
          <img src="/logo.png" alt="Logo" className="w-32 mb-10 mx-auto" />

          {/* Menu */}
          <ul className="space-y-3 flex-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  end={item.path === "/dashboard"} // Only exact match for Dashboard
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 hover:text-primary"
                    }`
                  }
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
