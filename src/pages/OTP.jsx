import React, { useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Notification from "../components/common/Notification";
import axios from "axios";
import { BASE_URL } from "../config/url";

const OTP = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const [notification, setNotification] = useState(null); // { title, message, link, linkText }
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Allow editing properly and auto-move next
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only numbers
    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    // move focus if typed a digit
    if (value && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  // ✅ Handle Backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = ""; // clear current
        setOtp(newOtp);
      } else if (index > 0) {
        inputs.current[index - 1].focus(); // move left if empty
      }
    }

    // optional: handle arrow navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  // ✅ Paste full OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      newOtp.forEach((_, i) => {
        if (inputs.current[i]) inputs.current[i].value = newOtp[i];
      });
    }
  };

  // ✅ Submit verification with proper error/success handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length !== 4) {
      setIsError(true);
      setNotification({
        title: "Invalid OTP",
        message: "Please enter a valid 4-digit OTP.",
        linkText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/otp/verify`, {
        email,
        otp: otpValue,
      });

      console.log("OTP verified:", res.data);

      setIsError(false);
      setNotification({
        title: "OTP Verified!",
        message: "Your email has been verified successfully.",
        link: "/forget-password/reset-password",
        linkText: "Continue",
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate("/forget-password/reset-password", { state: { email, otp: otpValue } });
      }, 1500);
    } catch (error) {
      console.error("Verification failed:", error);
      const errorMessage =
        error.response?.data?.message || "Invalid OTP, please try again.";
      
      setIsError(true);
      setNotification({
        title: "Verification Failed",
        message: errorMessage,
        linkText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Resend OTP with proper error/success handling
  const handleResend = async () => {
    if (!email) {
      setIsError(true);
      setNotification({
        title: "Error",
        message: "Email not found. Please go back and try again.",
        linkText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/otp/send`, {
        email,
        registration: false, // forgot password flow
      });

      console.log("OTP resent:", res.data);

      setIsError(false);
      setNotification({
        title: "OTP Sent!",
        message: "A new OTP has been sent to your email. It will expire in 5 minutes.",
        linkText: "OK",
      });

      // Reset OTP fields
      setOtp(["", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error) {
      console.error("Resend failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to resend OTP. Please try again.";

      setIsError(true);
      setNotification({
        title: "Resend Failed",
        message: errorMessage,
        linkText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6">
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          link={notification.link}
          linkText={notification.linkText}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-[450px] flex flex-col justify-center items-center gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <div className="text-left w-full">
          <Link to="/">
            <FaArrowLeft className="my-4 cursor-pointer" />
          </Link>

          <h1 className="font-bold text-2xl">Email Verification</h1>
          <p className="text-gray-500 text-sm mt-2">
            We have sent an OTP code to your email <br />
            <span className="font-medium text-black">{email}</span>. <br />
            Enter the OTP code below to verify.
          </p>
        </div>

        {/* ✅ OTP Input Fields */}
        <div className="flex gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-xl border-2 border-primary bg-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          ))}
        </div>

        <button
          disabled={loading}
          onClick={handleSubmit}
          className="bg-primary text-white px-6 py-3 rounded-full mt-4 w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-sm">
          Didn't receive any code?{" "}
          <span
            onClick={handleResend}
            disabled={loading}
            className="text-primary font-medium cursor-pointer hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Resend
          </span>
        </p>
      </div>
    </div>
  );
};

export default OTP;
