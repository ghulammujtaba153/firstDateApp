// ForgetPassword.jsx
import React, { useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/common/Notification";
import { BASE_URL } from "../config/url";
import axios from "axios";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("error"); // "error" or "success"
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const showError = (title, message) => {
    setNotificationType("error");
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const showSuccess = (title, message) => {
    setNotificationType("success");
    setNotificationTitle(title);
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      showError("Email Required!", "Please enter your email before continuing.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Invalid Email!", "Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/api/otp/send`, { 
        email, 
        registration: false 
      });

      // Check if the request was successful
      if (res.status === 200 || res.status === 201) {
        showSuccess(
          "OTP Sent!", 
          "A verification code has been sent to your email address."
        );
        
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate("/forget-password/otp", { state: { email } });
        }, 1500);
      }
    } catch (error) {
      console.log("Error details:", error);
      // setTimeout(() => {
      //     navigate("/forget-password/otp", { state: { email } });
      //   }, 1500);
      
      // Handle different error scenarios
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error;

        switch (status) {
          case 404:
            showError(
              "Email Not Found", 
              "This email address is not registered. Please check and try again."
            );
            break;
          case 429:
            showError(
              "Too Many Requests", 
              "Please wait a few minutes before requesting another OTP."
            );
            break;
          case 500:
            showError(
              "Server Error", 
              "Something went wrong on our end. Please try again later."
            );
            break;
          default:
            showError(
              "Request Failed", 
              message || "Failed to send OTP. Please try again."
            );
        }
      } else if (error.request) {
        // Network error - no response received
        showError(
          "Network Error", 
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        // Other errors
        showError(
          "Error", 
          "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {showNotification && (
        <Notification
          title={notificationTitle}
          message={notificationMessage}
          type={notificationType}
          linkText="Close"
          onClose={() => setShowNotification(false)}
        />
      )}

      <div className="max-w-[450px] w-full flex flex-col gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <Link to="/login">
          <FaArrowLeft className="my-4" />
        </Link>

        <h1 className="text-xl font-bold">Reset your password 🔑</h1>
        <p className="text-gray-600 mb-4">
          Please enter your email. We will send an OTP code to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 w-full">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <FaEnvelope />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-10 py-2 bg-gray-100 border rounded-lg outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-4 w-full rounded-full bg-primary text-white text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>

        
      </div>
    </div>
  );
};

export default ForgetPassword;