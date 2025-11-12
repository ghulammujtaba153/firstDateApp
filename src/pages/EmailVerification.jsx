import React, { useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/common/Notification";
import { BASE_URL } from "../config/url";
import axios from "axios";
import { useAuth } from "../context/authContext";

const EmailVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Handle OTP input change
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // allow only numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // keep only 1 digit
    setOtp(newOtp);

    // move to next input automatically
    if (index < 3 && value) {
      inputs.current[index + 1].focus();
    }
  };

  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, ""); // extract only numbers
    
    if (pastedData.length > 0) {
      const newOtp = ["", "", "", ""];
      // Fill OTP array with pasted digits
      for (let i = 0; i < Math.min(pastedData.length, 4); i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus on the last filled input or the last input
      const lastFilledIndex = Math.min(pastedData.length - 1, 3);
      if (inputs.current[lastFilledIndex]) {
        inputs.current[lastFilledIndex].focus();
      }
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

    if (!pendingUser?.email) {
      alert("No pending registration found. Please sign up again.");
      navigate("/signup");
      return;
    }

    if (otpValue.length < 4) {
      alert("Please enter the complete 4-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Verify OTP
      const verifyRes = await axios.post(`${BASE_URL}/api/otp/verify`, {
        email: pendingUser.email,
        otp: otpValue,
      });

      // Check if verification was successful (API returns 200 with message or success flag)
      const isSuccess = verifyRes.status === 200 && (
        verifyRes.data?.success === true || 
        verifyRes.data?.message?.toLowerCase().includes("success") ||
        verifyRes.data?.message === "OTP verified successfully"
      );

      if (isSuccess) {
        // Step 2: Register the user
        const registerRes = await axios.post(
          `${BASE_URL}/api/auth/register`,
          pendingUser
        );

        setUser(registerRes.data);
        localStorage.removeItem("pendingUser");

        setShow(true); // Show success message
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          "Verification failed. Please check your OTP.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    const pendingUser = JSON.parse(localStorage.getItem("pendingUser"));
    if (!pendingUser?.email) {
      alert("No pending registration found!");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/api/otp/send`, {
        email: pendingUser.email,
        registration: true,
      });
      alert("A new OTP has been sent to your email.");
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Failed to resend OTP. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6">
      {show && (
        <Notification
          title="Account Created!"
          message="Your account has been successfully created."
          link="/onboarding"
          linkText="Continue"
          onClose={() => setShow(false)}
        />
      )}

      <div className="max-w-[450px] flex flex-col justify-center items-center gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <div className="text-left w-full">
          <Link to="/">
            <FaArrowLeft className="my-4 cursor-pointer" />
          </Link>
          <h1 className="font-bold text-2xl">Email Verification</h1>
          <p className="text-gray-500 text-sm mt-2">
            We have sent a 4-digit OTP code to your registered email. Enter it
            below to verify your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {/* OTP Input Fields */}
          <div className="flex items-center justify-center gap-4" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputs.current[index] = el)}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => {
                  handleKeyDown(e, index);
                  // Submit form when Enter is pressed
                  if (e.key === "Enter" && otp.join("").length === 4) {
                    handleSubmit(e);
                  }
                }}
                onPaste={handlePaste}
                maxLength={1}
                className="w-14 h-14 text-center text-xl border-2 border-primary bg-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-primary text-white px-6 py-3 rounded-full mt-4 w-full ${
              loading && "opacity-70 cursor-not-allowed"
            }`}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

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
