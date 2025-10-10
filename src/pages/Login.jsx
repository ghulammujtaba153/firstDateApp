import React, { useState } from "react";
import { FaEnvelope, FaLock, FaGoogle, FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";
import axios from "axios";
import { BASE_URL } from "../config/url";
import { useAuth } from "../context/authContext";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // {title, message, type}
  const { login } = useAuth(); // assuming you store logged in user in context

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Redirect user to your backend Google auth route
    window.location.href = `${BASE_URL}/auth/google/callback`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, form);

      login(res.data.user, res.data.token);

      // success notification
      setNotification({
        title: "Login Successful 🎉",
        message: "Welcome back! Redirecting to dashboard...",
        type: "success",
        link: "/dashboard",
        linkText: "Go to Dashboard",
      });
    } catch (error) {
      console.error(error);

      // error notification
      setNotification({
        title: "Login Failed ❌",
        message: error.response?.data?.message || "Something went wrong. Please try again.",
        type: "error",
        linkText: "ok",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen">
      {/* Notification */}
      {notification && (
        <Notification
          title={notification.title}
          message={notification.message}
          link={notification.link}
          linkText={notification.linkText}
          type={notification.type}
          onClose={() => setNotification(null)}
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
            <h1 className="text-3xl font-bold">
              Welcome back <span className="inline-block">👋</span>
            </h1>
            <p className="text-gray-500 text-sm">
              Please enter your email & password to sign in.
            </p>
          </div>

          {/* Email */}
          <label className="self-start mb-1 font-medium">Email</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2">
            <FaEnvelope className="mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="outline-none w-full bg-transparent"
            />
          </div>
          <Link
            to="/forget-password"
            className="self-end text-sm text-primary mb-2"
          >
            Forgot Password?
          </Link>

          {/* Password */}
          <label className="self-start mb-1 font-medium">Password</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2 relative">
            <FaLock className="mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              placeholder="Password"
              required
              className="outline-none w-full bg-transparent"
            />
            <span
              className="absolute right-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {!showPassword ? <LuEyeClosed /> : <FaEye />}
            </span>
          </div>

          {/* signin button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white rounded-full p-2 w-full my-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Or sign up with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center border border-gray-100 rounded-full p-2 w-full my-2 hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500 mr-2" />
            Sign up with Google
          </button>

          <p className="text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary">
              Sign up
            </Link>
          </p>
        </form>
      </div>

      {/* Right side - image */}
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
          src="/signin.png"
          alt="register"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="hidden md:block" style={{ width: "50vw" }}></div>
    </div>
  );
};

export default Login;
