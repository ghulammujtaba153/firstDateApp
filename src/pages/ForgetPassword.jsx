// ForgetPassword.jsx
import React, { useState } from "react";
import { FaEnvelope, FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Notification from "../components/common/Notification";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setShow(true); // show error if email is empty
      return;
    }

    // 👉 Send OTP request to API here if needed
    // go to OTP page with email in state
    navigate("/forget-password/otp", { state: { email } });
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {show && (
        <Notification
          title="Email Required!"
          message="Please enter your email before continuing."
          link=""
          linkText="Close"
          onClose={() => setShow(false)}
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
            />
          </div>

          <button
            type="submit"
            className="px-4 py-4 w-full rounded-full bg-primary text-white text-center"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
