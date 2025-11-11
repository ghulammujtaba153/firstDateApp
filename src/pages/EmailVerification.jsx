import React, { useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";
import { BASE_URL } from "../config/url";
import axios from "axios";
import { useAuth } from "../context/authContext";

const EmailVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const {setUser} = useAuth()

  // Handle OTP input change
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // allow only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // keep only 1 digit
    setOtp(newOtp);

    // move to next input automatically
    if (index < 3 && value) {
      inputs.current[index + 1].focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  // Submit OTP and complete registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    const pendingUser = JSON.parse(localStorage.getItem("pendingUser"));

    if (!pendingUser) {
      alert("No pending registration found!");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyRes = await axios.post(`${BASE_URL}/api/otp/verify`, {
        email: pendingUser.email,
        otp: otpValue,
      });
      console.log("OTP Verified:", verifyRes.data);

      // Step 2: Register the user after OTP verification
      const registerRes = await axios.post(
        `${BASE_URL}/api/auth/register`,
        pendingUser
      );
      console.log("User Registered:", registerRes.data);

      setUser(registerRes.data)

      // Clear temporary data
      localStorage.removeItem("pendingUser");

      // Show success message
      setShow(true);
    } catch (error) {
      console.error(error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    const pendingUser = JSON.parse(localStorage.getItem("pendingUser"));
    if (!pendingUser) {
      alert("No pending registration found!");
      return;
    }
    try {
      const res = await axios.post(`${BASE_URL}/api/otp/send`, {
        email: pendingUser.email,
        registration: true,
      });
      console.log("Resent OTP:", res.data);
      alert("OTP resent to your email.");
    } catch (error) {
      console.error(error);
      alert("Failed to resend OTP.");
    }
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6">
      {show && (
        <Notification
          title="Account Created!"
          message="Your account has been successfully created."
          link="/onboarding"
          linkText="continue"
          onClose={() => setShow(false)}
        />
      )}

      <div className="max-w-[450px] flex flex-col justify-center items-center gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <div className="text-left w-full">
          <Link to="/">
            <FaArrowLeft className="my-4" />
          </Link>
          <h1 className="font-bold text-2xl">Email Verification</h1>
          <p className="text-gray-500 text-sm mt-2">
            We have sent an OTP code to your email. Enter the OTP code below to
            verify.
          </p>
        </div>

        {/* OTP Input Fields */}
        <div className="flex gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputs.current[index] = el)}
              type="text"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              maxLength={1}
              className="w-14 h-14 text-center text-xl border-2 border-primary bg-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-primary text-white px-6 py-3 rounded-full mt-4 w-full"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>

        <p className="text-sm">
          Didn’t receive any code?{" "}
          <span
            className="text-primary font-medium cursor-pointer"
            onClick={resendOtp}
          >
            Resend
          </span>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
