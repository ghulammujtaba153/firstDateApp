import React, { useState } from "react";
import { Link } from "react-router-dom";
import Notification from "../components/common/Notification";
import { FaArrowLeft } from "react-icons/fa";
import GenderSection from "../components/onboarding/GenderSection";
import HealthSection from "../components/onboarding/HealthSection";
import BodyTypeSection from "../components/onboarding/BodyTypeSection";
import PhotosSection from "../components/onboarding/PhotosSection";
import DOBSection from "../components/onboarding/DOBSection";
import EducationSection from "../components/onboarding/EducationSection";
import HeightSection from "../components/onboarding/HeightSection";
import HobbiesSection from "../components/onboarding/HobbiesSection";
import WeightSection from "../components/onboarding/WeightSection";
import Locationsection from "../components/onboarding/Locationsection";
import UserNameSection from "../components/onboarding/UserNameSection";

const OnBoarding = () => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // total steps based on sections
  const totalSteps = 10; // last index (0–10)

  // progress percentage
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {show && (
        <Notification
          title="Setup Complete!"
          message="Your profile has been successfully created."
          link="/home"
          linkText="continue"
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
          {currentStep === 0 && <UserNameSection />}
          {currentStep === 1 && <GenderSection />}
          {currentStep === 2 && <DOBSection />}
          {currentStep === 3 && <HeightSection />}
          {currentStep === 4 && <WeightSection />}
          {currentStep === 5 && <BodyTypeSection />}
          {currentStep === 6 && <HealthSection />}
          {currentStep === 7 && <EducationSection />}
          {currentStep === 8 && <HobbiesSection />}
          {currentStep === 9 && < PhotosSection/>}
          {currentStep === 10 && <Locationsection />}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
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

export default OnBoarding;
