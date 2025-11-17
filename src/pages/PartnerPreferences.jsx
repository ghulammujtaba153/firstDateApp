import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth();
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

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
      const res = await axios.put(
        `${BASE_URL}/api/auth/onboarding/${user._id}`,
        form
      );
      setUser(res.data);
      setShow(true);
      console.log("✅ Preferences saved:", form);
      setShowVerificationModal(true);
    } catch (error) {
      console.error("❌ Error saving preferences:", error);
    }
  };

  const handleVerificationClick = async () => {
    try {
      setVerificationLoading(true);

      // Start DIDIT workflow
      const response = await axios.post(
        `${BASE_URL}/api/workflow/start`,
        {
          userId: user?._id || user?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.workflowUrl || response.data?.redirectUrl) {
        // Redirect to DIDIT's hosted verification UI
        const workflowUrl = response.data.workflowUrl || response.data.redirectUrl;
        window.location.href = workflowUrl;
      } else {
        console.error("No workflow URL received:", response.data);
        alert("Failed to start verification. Please try again.");
        setVerificationLoading(false);
      }
    } catch (error) {
      console.error("Error starting verification:", error);
      alert(error.response?.data?.message || "Failed to start verification. Please try again.");
      setVerificationLoading(false);
    }
  };

  const handleSkipVerification = () => {
    setShowVerificationModal(false);
    navigate('/dashboard');
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
          link="/dashboard"
          linkText="Continue"
          onClose={() => setShow(false)}
        />
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[30px] p-6 md:p-8 max-w-md w-full shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Verify Your Profile
              </h2>
              <p className="text-gray-600">
                Would you like to verify yourself now? This helps increase trust and matching quality.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVerificationClick}
                disabled={verificationLoading}
                className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verificationLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  'Yes, Verify Now'
                )}
              </button>
              <button
                onClick={handleSkipVerification}
                disabled={verificationLoading}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can always verify later in your profile settings.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-[450px] w-full flex flex-col justify-center items-center gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <div className="w-full">
          <Link to="/">
            <FaArrowLeft className="my-4 cursor-pointer" />
          </Link>


          {/* Progress bar */}
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

          

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            <button
              disabled={currentStep === 0}
              onClick={handlePrev}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Back
            </button>

            <button
              onClick={() => {
                if (currentStep === totalSteps) {
                  // Show verification modal on finish
                  handleSubmit();
                } else {
                  handleNext();
                }
              }}
              className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
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
