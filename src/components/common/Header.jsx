import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBell, FaCommentDots, FaUser, FaSignOutAlt, FaTimes, FaCamera } from "react-icons/fa";
import { VscVerifiedFilled } from "react-icons/vsc";
import { useAuth } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config/url";
import axios from "axios";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { user, logout, token, setUser } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  console.log("user in header",user);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?._id || !token) return;
    
    try {
      setLoadingNotifications(true);
      const response = await axios.get(`${BASE_URL}/api/notification/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (user?._id && token && notificationOpen) {
      fetchNotifications();
    }
  }, [user?._id, token, notificationOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    if (dropdownOpen || notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, notificationOpen]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  }

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setDropdownOpen(false);
  }

  const handleVerificationClick = async () => {
    try {
      setDropdownOpen(false);
      
      // Show loading state
      const loadingMessage = "Starting verification...";
      
      // Start DIDIT workflow
      const response = await axios.post(`${BASE_URL}/api/workflow/start`, {
        userId: user?._id || user?.id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.workflowUrl || response.data?.redirectUrl) {
        // Redirect to DIDIT's hosted verification UI
        const workflowUrl = response.data.workflowUrl || response.data.redirectUrl;
        window.location.href = workflowUrl;
      } else {
        console.error("No workflow URL received:", response.data);
        alert("Failed to start verification. Please try again.");
      }
    } catch (error) {
      console.error("Error starting verification:", error);
      alert(error.response?.data?.message || "Failed to start verification. Please try again.");
    }
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await axios.patch(
          `${BASE_URL}/api/notification/mark-read`,
          { notificationIds: [notification._id] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update local state
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to link if provided
    if (notification.link) {
      setNotificationOpen(false);
      navigate(notification.link);
    }
  }

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

        {/* Notification Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            className="text-primary rounded-lg p-1 relative"
            onClick={() => setNotificationOpen(!notificationOpen)}
          >
            <FaBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 max-h-96 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={16} />
                </button>
              </div>
              
              <div className="overflow-y-auto slim-scrollbar">
                {loadingNotifications ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer flex items-start gap-3 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {notification.avatar && (
                          <img
                            src={notification.avatar}
                            alt="notification"
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          {notification.title && (
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {notification.title}
                            </p>
                          )}
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <FaBell className="mx-auto mb-2 text-gray-300" size={32} />
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* <button className="text-primary  rounded-lg p-1">
          <FaCommentDots size={20}  />
        </button> */}


        <div className="h-10 w-px bg-gray-300"></div>


        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"} 
            alt="profile"
            className="rounded-full w-10 h-10 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {
            user?.verified && (
              <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                <VscVerifiedFilled size={10} />
              </span>
            )
          }

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
              <p className="px-4 py-2 text-gray-700 font-semibold">Hello, {user?.username || 'User'}</p>
              <hr />
              <button
               onClick={handleVerificationClick}
               disabled={user?.verified}
               className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 ${
                 user?.verified 
                   ? "text-gray-400 cursor-not-allowed opacity-50" 
                   : "text-gray-600"
               }`}
               title={user?.verified ? "Already verified" : "Start verification"}
             >
                <FaCamera /> {user?.verified ? "Verified" : "Verification"}
              </button>
              <button 
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-600"
              >
                <FaUser /> Profile
              </button>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-gray-600"
              >
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
