import React, { useState } from "react";
import { FaEnvelope, FaLock, FaPhoneAlt, FaGoogle, FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";

const Register = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShow(true);
  };

  return (
    <div className="flex w-full min-h-screen">
      {show && (
        <Notification
          title="Verify Your Email"
          message="A verification pin has been sent to your email."
          link="/email-verification"
          linkText="continue"
          onClose={() => setShow(false)}
        />
      )}
      {/* Left side - form */}
      <div className="flex flex-1 justify-center items-center py-10">
        <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center p-10 border border-primary rounded-[20px] shadow-md w-[400px]">
          <div className="text-left flex flex-col gap-4 my-4 w-full">
            <img src="/logo.png" alt="register" className="w-20 h-20" />
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-gray-500 text-sm">
              Create your account in seconds. We’ll help you find your perfect
              date.
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
              className="outline-none w-full bg-transparent"
            />
          </div>

          {/* Phone */}
          <label className="self-start mb-1 font-medium">Phone</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2">
            <FaPhoneAlt className="mr-2" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              onChange={handleChange}
              className="outline-none w-full bg-transparent"
            />
          </div>

          {/* Password */}
          <label className="self-start mb-1 font-medium">Password</label>
          <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full my-2 relative">
            <FaLock className="mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
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

          {/* Confirm Password */}
          <label className="self-start mb-1 font-medium">
            Confirm Password
          </label>
          <div className="flex items-center border rounded-md border-gray-100 bg-gray-50 p-2 w-full my-2 relative">
            <FaLock className="mr-2" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
              className="outline-none w-full bg-transparent"
            />
            <span
              className="absolute right-3 cursor-pointer text-gray-400"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {!showConfirmPassword ? <LuEyeClosed /> : <FaEye />}
            </span>
          </div>

          {/* Register button */}
          <button className="bg-primary text-white rounded-full p-2 w-full my-2">
            Register
          </button>

          {/* Or sign up with Google */}
          <button className="flex items-center justify-center border border-gray-200 rounded-full p-2 w-full my-2 hover:bg-gray-100 transition">
            <FaGoogle className="text-red-500 mr-2" />
            Sign up with Google
          </button>

          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              signin
            </Link>
          </p>
        </form>
      </div>

      {/* Right side - image (hidden below md) */}
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
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </div>
      {/* Add padding to left side to prevent overlap on md+ */}
      <div className="hidden md:block" style={{ width: "50vw" }}></div>
    </div>
  );
};

export default Register;
