import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTachometerAlt,
  FaUser,
  FaCog,
  FaCalendarAlt,
  FaSignOutAlt,
  FaPhone,
  FaMoneyBillAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { TfiStar } from "react-icons/tfi";
import { MdOutlinePrivacyTip } from "react-icons/md";
import { useAuth } from "../../context/authContext";
import { BASE_URL } from "../../config/url";
import axios from "axios";
import { useSocket } from "../../context/socketContext";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { logout, user: currentUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const location = useLocation();

  // Fetch total unread messages count
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      const response = await axios.get(`${BASE_URL}/api/chat/user/${currentUser._id}`);
      const chats = response.data || [];
      const totalUnread = chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
      setTotalUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setTotalUnreadCount(0);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    fetchUnreadCount();

    // Listen for new messages via socket to update unread count
    if (socket && isConnected) {
      const handleNewMessage = () => {
        // Refetch unread count when new message arrives
        fetchUnreadCount();
      };

      socket.on('message:new', handleNewMessage);

      return () => {
        socket.off('message:new', handleNewMessage);
      };
    }
  }, [currentUser?._id, socket, isConnected, fetchUnreadCount]);

  // Refresh unread count when navigating to/from chats page
  useEffect(() => {
    if (location.pathname === '/dashboard/chats' || location.pathname === '/dashboard') {
      // Refresh count when leaving or entering chats page
      const timer = setTimeout(() => {
        fetchUnreadCount();
      }, 1000); // Small delay to allow messages to be marked as read

      return () => clearTimeout(timer);
    }
  }, [location.pathname, fetchUnreadCount]);

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Chats", icon: <FaPhone />, path: "/dashboard/chats", unreadCount: totalUnreadCount },
    { name: "Matches", icon: <TfiStar />, path: "/dashboard/matches" },
    { name: "Events", icon: <FaCalendarAlt />, path: "/dashboard/events" },
    { name: "Subscriptions", icon: <FaMoneyBillAlt />, path: "/dashboard/subscriptions" },
    { name: "Profile", icon: <FaUser />, path: "/dashboard/profile" },
    { name: "Support", icon: <FaQuestionCircle />, path: "/dashboard/support" },
    { name: "Settings", icon: <FaCog />, path: "/dashboard/settings" },
    { name: "Privacy Policy", icon: <MdOutlinePrivacyTip />, path: "/dashboard/privacy-policy" },
    // { name: "Logout", icon: <FaSignOutAlt />, path: "" },
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
        <div className="flex flex-col h-full overflow-y-auto p-6 slim-scrollbar">
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
                    `flex items-center justify-between gap-3 px-4 py-3 rounded-full transition-colors duration-200 
                    ${
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 hover:text-primary"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.unreadCount > 0 && (
                    <span className={`bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                      item.path === "/dashboard/chats" ? "" : ""
                    }`}>
                      {item.unreadCount > 99 ? '99+' : item.unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-full transition-colors duration-200 hover:bg-gray-100 hover:text-primary">
            <FaSignOutAlt />
            <p>logout</p>
          </button>

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
