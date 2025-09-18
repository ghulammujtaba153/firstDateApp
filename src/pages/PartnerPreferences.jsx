import React, { useState } from "react";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";
import { FaArrowLeft } from "react-icons/fa";
import PartnerAge from "../components/partnerPreferences/PartnerAge";
import PartnerBody from "../components/partnerPreferences/PartnerBody";
import PartnerHealth from "../components/partnerPreferences/PartnerHealth";
import PartnerHobbies from "../components/partnerPreferences/PartnerHobbies";
import PartnerLocation from "../components/partnerPreferences/PartnerLocation";

const PartnerPreferences = () => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // total steps (adjust according to available sections)
  const totalSteps = 4; // last index (0–4) → 5 steps total

  // progress percentage
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {show && (
        <Notification
          title="Preferences Saved!"
          message="Your partner preferences has been successfully saved."
          link="/"
          linkText="Continue"
          onClose={() => setShow(false)}
        />
      )}

      {/* Onboarding Sections */}
      <div className="max-w-[450px] w-full flex flex-col justify-center items-center gap-6 border border-primary p-10 rounded-[40px] shadow-md">
        <div className="w-full">
          <Link to="/">
            <FaArrowLeft className="my-4" />
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
          {currentStep === 0 && <PartnerAge />}
          {currentStep === 1 && <PartnerBody />}
          {currentStep === 2 && <PartnerHealth />}
          {currentStep === 3 && <PartnerHobbies />}
          {currentStep === 4 && <PartnerLocation />}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {/* Back button (optional) */}
            {/* <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
            >
              Back
            </button> */}

            <button
              onClick={() => {
                if (currentStep < totalSteps) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  setShow(true); // final step shows notification
                }
              }}
              className="px-4 py-4 w-full rounded-full bg-primary text-white"
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
