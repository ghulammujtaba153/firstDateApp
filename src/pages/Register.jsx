import React, { useState } from "react";
import { FaEnvelope, FaLock, FaPhoneAlt, FaGoogle, FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";
import { BASE_URL } from "./../config/url";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css"; // ✅ import the default styling

const Register = () => {
  const [show, setShow] = useState(false); // success notification
  const [error, setError] = useState(null); // error notification
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSignup = () => {
    window.location.href = `${BASE_URL}/auth/google/callback`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Send OTP to email
      const res = await axios.post(`${BASE_URL}/api/otp/send`, {
        email: form.email,
        registration: true,
      });

      console.log("OTP sent:", res.data);

      // Step 2: Save user data temporarily
      localStorage.setItem("pendingUser", JSON.stringify(form));

      // Step 3: Show success notification → go to verification page
      setShow(true);
    } catch (err) {
      console.error(err);
      localStorage.setItem("pendingUser", JSON.stringify(form));
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* ✅ Success Notification */}
      {show && (
        <Notification
          title="Verify Your Email"
          message="A verification pin has been sent to your email."
          link="/email-verification"
          linkText="Continue"
          onClose={() => setShow(false)}
        />
      )}

      {/* ❌ Error Notification */}
      {error && (
        <Notification
          title="Error"
          message={error}
          onClose={() => setError(null)}
          linkText="ok"
        />
      )}

      {/* Left side - form */}
      <div className="flex flex-1 justify-center items-center py-10">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col justify-center items-center p-10 border border-primary rounded-[20px] shadow-md w-[400px]"
        >
          <div className="text-left flex flex-col gap-4 my-4 w-full">
            <img src="/logo.png" alt="register" className="w-20 h-20" />
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-gray-500 text-sm">
              Create your account in seconds. We’ll help you find your perfect date.
            </p>
          </div>

          {/* 📧 Email */}
          <label className="self-start mb-1 font-medium">Email</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2">
            <FaEnvelope className="mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="outline-none w-full bg-transparent"
              required
            />
          </div>

          {/* 📱 Phone with country dropdown */}
          <label className="self-start mb-1 font-medium">Phone</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2">
            <FaPhoneAlt className="mr-2" />
            <div className="w-full">
              <PhoneInput
                country={"us"} // us default
                value={form.phone}
                onChange={(phone) => setForm({ ...form, phone })}
                inputStyle={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  fontSize: "14px",
                }}
                buttonStyle={{
                  border: "none",
                  background: "transparent",
                }}
                dropdownStyle={{
                  background: "#fff",
                }}
                enableSearch={true}
                inputProps={{
                  required: true,
                  name: "phone",
                }}
              />
            </div>
          </div>

          {/* 🔒 Password */}
          <label className="self-start mb-1 font-medium">Password</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2 relative">
            <FaLock className="mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="outline-none w-full bg-transparent"
              required
            />
            <span
              className="absolute right-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <LuEyeClosed /> : <FaEye />}
            </span>
          </div>

          {/* 🔒 Confirm Password */}
          <label className="self-start mb-1 font-medium">Confirm Password</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2 relative">
            <FaLock className="mr-2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              className="outline-none w-full bg-transparent"
              required
            />
            <span
              className="absolute right-3 cursor-pointer text-gray-400"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              {!showConfirmPassword ? <LuEyeClosed /> : <FaEye />}
            </span>
          </div>

          {/* 🔘 Register button */}
          <button
            disabled={loading}
            className="bg-primary text-white rounded-full p-2 w-full my-2"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>

          {/* 🧭 Or sign up with Google */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="flex items-center justify-center border border-gray-200 rounded-full p-2 w-full my-2 hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500 mr-2" />
            Sign up with Google
          </button>

          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Sign in
            </Link>
          </p>
        </form>
      </div>

      {/* 🖼️ Right side image */}
      <div
        className="hidden md:block w-1/2 h-screen"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          width: "50vw",
          height: "100vh",
          zIndex: 0,
        }}
      >
        <img
          src="/signup.png"
          alt="register"
          className="w-full h-full object-cover"
        />
      </div>

      {/* padding for layout */}
      <div className="hidden md:block" style={{ width: "50vw" }}></div>
    </div>
  );
};

export default Register;
