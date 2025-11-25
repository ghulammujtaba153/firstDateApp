import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaLock, FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { BASE_URL } from "../config/url";
import Notification from "../components/common/Notification";

const Invite = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [show, setShow] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.put(
                `${BASE_URL}/api/auth/invite/reset-password/${token}`,
                {
                    password: formData.password,
                }
            );
            console.log(res);
            setShow(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Failed to reset password");
            setLoading(false);
        }
    };

    return (
        <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6">
            {show && (
                <Notification
                    title="Password Reset!"
                    message="Your password has been successfully reset."
                    link="/login"
                    linkText="Continue to Login"
                    onClose={() => setShow(false)}
                />
            )}

            <div className="max-w-[450px] w-full flex flex-col gap-6 border border-primary p-10 rounded-[40px] shadow-md">
                <div className="text-left">
                    <Link to="/login">
                        <FaArrowLeft className="my-4" />
                    </Link>
                    <h1 className="font-bold text-2xl">Create New Password 🔒</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Create your new password. if you forgot it, then you have to do forgot password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
                    {/* New Password */}
                    <label className="self-start mb-1 font-medium">New Password</label>
                    <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full relative">
                        <FaLock className="mr-2" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="New Password"
                            className="outline-none w-full bg-transparent"
                            required
                        />
                        <span
                            className="absolute right-3 cursor-pointer text-gray-400"
                            onClick={() => setShowPassword((prev) => !prev)}
                            tabIndex={0}
                            role="button"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEye /> : <LuEyeClosed />}
                        </span>
                    </div>

                    {/* Confirm Password */}
                    <label className="self-start mb-1 font-medium">Confirm Password</label>
                    <div className="flex items-center border border-gray-100 bg-gray-50 rounded-md p-2 w-full relative">
                        <FaLock className="mr-2" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="outline-none w-full bg-transparent"
                            required
                        />
                        <span
                            className="absolute right-3 cursor-pointer text-gray-400"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            tabIndex={0}
                            role="button"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <FaEye /> : <LuEyeClosed />}
                        </span>
                    </div>

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-white rounded-full px-2 py-4 w-full my-2"
                    >
                        {loading ? "Loading..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Invite;