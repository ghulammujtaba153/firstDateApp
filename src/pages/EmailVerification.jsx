import React, { useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";

const EmailVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = useRef([]);
  const [show, setShow] = useState(false);

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

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    setShow(true);
    
  }

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
        <div className="text-left">
            <Link to="/" ><FaArrowLeft className="my-4"/></Link>
        
          <h1 className="font-bold text-2xl">Email Verification</h1>
          <p className="text-gray-500 text-sm mt-2">
            We have sent an OTP code to your email and ********ley@yourdomain.com.  
            Enter the OTP code below to verify.
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


        <button onClick={handleSubmit} className="bg-primary text-white px-6 py-3 rounded-full mt-4 w-full">
          Verify
        </button>

        <p className="text-sm">
          Didn’t receive any code?{" "}
          <span className="text-primary font-medium cursor-pointer">Resend</span>
        </p>
      </div>
    </div>
  );
};

export default EmailVerification;
