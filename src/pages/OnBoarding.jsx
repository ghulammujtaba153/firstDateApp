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
import PersonalitySection from "../components/onboarding/PersonalitySection";
import PoliticsSection from "../components/onboarding/PoliticsSection";
import ReligionSection from "../components/onboarding/ReligionSection";
import FamillySection from "../components/onboarding/FamillySection";
import ChatOpenerSection from "../components/onboarding/ChatOpenerSection";
import { useAuth } from "../context/authContext";
import axios from "axios";
import { BASE_URL } from "../config/url";

const OnBoarding = () => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 🔹 Centralized form data that matches your Mongoose schema
  const [formData, setFormData] = useState({
    username: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    bodyType: [],
    healthInfo: [],
    education: {
      field: "",
      occupation: "",
      university: "",
    },
    hobbies: [],
    images: [],
    location: "",
    personality: [],
    politics: "",
    religion: "",
    family: {
      haveKids: "",
      wantKids: "",
    },
    chatOpeners: [],
  });

  const totalSteps = 15; // steps: 0–15 inclusive
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  // ✅ Submit form
  const handleSubmit = async () => {
    if (!user?._id) {
      console.error("❌ No user found in context, cannot submit onboarding");
      return;
    }

    setLoading(true);
    console.log("🚀 Submitting onboarding data:", formData);
    console.log("👤 User ID:", user._id);

    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/onboarding/${user._id}`,
        formData
      );
      console.log("✅ Onboarding success:", response.data);
      setShow(true);
    } catch (error) {
      console.error("❌ Onboarding failed:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {show && (
        <Notification
          title="Setup Complete!"
          message="Your profile has been successfully created."
          link="partner-preferences"
          linkText="continue"
          onClose={() => setShow(false)}
        />
      )}

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

          {/* Step Components */}
          {currentStep === 0 && (
            <UserNameSection
              value={formData.username}
              onChange={(val) => setFormData({ ...formData, username: val })}
            />
          )}
          {currentStep === 1 && (
            <GenderSection
              value={formData.gender}
              onChange={(val) => setFormData({ ...formData, gender: val })}
            />
          )}
          {currentStep === 2 && (
            <DOBSection
              value={formData.dob}
              onChange={(val) => setFormData({ ...formData, dob: val })}
            />
          )}
          {currentStep === 3 && (
            <HeightSection
              value={formData.height}
              onChange={(val) => setFormData({ ...formData, height: val })}
            />
          )}
          {currentStep === 4 && (
            <WeightSection
              value={formData.weight}
              onChange={(val) => setFormData({ ...formData, weight: val })}
            />
          )}
          {currentStep === 5 && (
            <BodyTypeSection
              value={formData.bodyType}
              onChange={(val) => setFormData({ ...formData, bodyType: val })}
            />
          )}
          {currentStep === 6 && (
            <HealthSection
              value={formData.healthInfo}
              onChange={(val) => setFormData({ ...formData, healthInfo: val })}
            />
          )}
          {currentStep === 7 && (
            <EducationSection
              value={formData.education}
              onChange={(val) => setFormData({ ...formData, education: val })}
            />
          )}
          {currentStep === 8 && (
            <HobbiesSection
              value={formData.hobbies}
              onChange={(val) => setFormData({ ...formData, hobbies: val })}
            />
          )}
          {currentStep === 9 && (
            <PhotosSection
              value={formData.images}
              onChange={(val) => setFormData({ ...formData, images: val })}
            />
          )}
          {currentStep === 10 && (
            <Locationsection
              value={formData.location}
              onChange={(val) => setFormData({ ...formData, location: val })}
            />
          )}
          {currentStep === 11 && (
            <PersonalitySection
              value={formData.personality}
              onChange={(val) => setFormData({ ...formData, personality: val })}
            />
          )}
          {currentStep === 12 && (
            <PoliticsSection
              value={formData.politics}
              onChange={(val) => setFormData({ ...formData, politics: val })}
            />
          )}
          {currentStep === 13 && (
            <ReligionSection
              value={formData.religion}
              onChange={(val) => setFormData({ ...formData, religion: val })}
            />
          )}
          {currentStep === 14 && (
            <FamillySection
              value={formData.family}
              onChange={(val) => setFormData({ ...formData, family: val })}
            />
          )}
          {currentStep === 15 && (
            <ChatOpenerSection
              value={formData.chatOpeners}
              onChange={(val) => setFormData({ ...formData, chatOpeners: val })}
            />
          )}
          {/* Navigation Buttons */}
          <div className="flex flex-col gap-4 mt-6">
            <button
              disabled={loading}
              onClick={() => {
                if (currentStep < totalSteps) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  handleSubmit();
                }
              }}
              className="px-4 py-4 w-full rounded-full bg-primary text-white disabled:opacity-50"
            >
              {currentStep === totalSteps ? (loading ? "Submitting..." : "Finish") : "Continue"}
            </button>

            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
