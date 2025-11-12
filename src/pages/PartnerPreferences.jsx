import React, { useState } from "react";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";
import { FaArrowLeft } from "react-icons/fa";
import PartnerAge from "../components/partnerPreferences/PartnerAge";
import PartnerBody from "../components/partnerPreferences/PartnerBody";
import PartnerHealth from "../components/partnerPreferences/PartnerHealth";
import PartnerHobbies from "../components/partnerPreferences/PartnerHobbies";
import PartnerLocation from "../components/partnerPreferences/PartnerLocation";
import PartnerPersonality from "../components/partnerPreferences/PartnerPersonality";
import axios from "axios";
import { BASE_URL } from "../config/url";
import { useAuth } from "../context/authContext";

const PartnerPreferences = () => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    partnerAge: { min: 18, max: 30 },
    partnerBodyType: [],
    partnerHealth: [],
    partnerHobbies: [],
    partnerLocation: "",
    partnerPersonality: [],
    onboardingComlete: true,
  });

  const totalSteps = 5; // 0–4 → 5 steps
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  const handleSubmit = async () => {
    try {
      const res = await axios.put(`${BASE_URL}/api/auth/onboarding/${user._id}`, form);
      setUser(res.data);
      setShow(true);
      console.log("✅ Preferences saved:", form);
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit(); // ✅ Call submit on last step
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {show && (
        <Notification
          title="Preferences Saved!"
          message="Your partner preferences have been successfully saved."
          link="/verification"
          linkText="Continue"
          onClose={() => setShow(false)}
        />
      )}

      <div className="max-w-[450px] w-full flex flex-col justify-center items-center gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <div className="w-full">
          <Link to="/">
            <FaArrowLeft className="my-4 cursor-pointer" />
          </Link>

          {/* Progress Bar */}
          <div className="w-full max-w-[450px] mt-4">
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1 text-right">
              Step {currentStep + 1} of {totalSteps + 1}
            </p>
          </div>

          {/* Render based on step */}
          {currentStep === 0 && <PartnerAge form={form} setForm={setForm} />}
          {currentStep === 1 && <PartnerBody form={form} setForm={setForm} />}
          {currentStep === 2 && <PartnerHealth form={form} setForm={setForm} />}
          {currentStep === 3 && <PartnerHobbies form={form} setForm={setForm} />}
          {currentStep === 4 && <PartnerLocation form={form} setForm={setForm} />}
          {currentStep === 5 && <PartnerPersonality form={form} setForm={setForm} />}
          
          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              disabled={currentStep === 0}
              onClick={handlePrev}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Back
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-full bg-primary text-white"
            >
              {currentStep === totalSteps ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPreferences;
