import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaArrowLeft, FaUser, FaInfoCircle, FaCamera } from 'react-icons/fa';
import upload from '../../../utils/upload';

// Import onboarding components
import GenderSection from '../../onboarding/GenderSection';
import HealthSection from '../../onboarding/HealthSection';
import BodyTypeSection from '../../onboarding/BodyTypeSection';
import PhotosSection from '../../onboarding/PhotosSection';
import DOBSection from '../../onboarding/DOBSection';
import EducationSection from '../../onboarding/EducationSection';
import HeightSection from '../../onboarding/HeightSection';
import HobbiesSection from '../../onboarding/HobbiesSection';
import WeightSection from '../../onboarding/WeightSection';
import Locationsection from '../../onboarding/Locationsection';
import UserNameSection from '../../onboarding/UserNameSection';

// Import partner preference components
import PartnerAge from '../../partnerPreferences/PartnerAge';
import PartnerBody from '../../partnerPreferences/PartnerBody';
import PartnerHealth from '../../partnerPreferences/PartnerHealth';
import PartnerHobbies from '../../partnerPreferences/PartnerHobbies';
import PartnerLocation from '../../partnerPreferences/PartnerLocation';

// Edit Options Modal
export const EditOptionsModal = ({ show, onClose, onSelectOption }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onSelectOption('profile')}
            className="p-6 border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-colors text-center"
          >
            <FaUser className="mx-auto mb-2" size={32} />
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Basic Information</p>
          </button>
          
          <button
            onClick={() => onSelectOption('onboarding')}
            className="p-6 border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-colors text-center"
          >
            <FaInfoCircle className="mx-auto mb-2" size={32} />
            <h3 className="font-semibold">Onboarding</h3>
            <p className="text-sm text-gray-500 mt-1">Personal Details</p>
          </button>
          
          <button
            onClick={() => onSelectOption('partner')}
            className="p-6 border-2 border-primary rounded-2xl hover:bg-primary hover:text-white transition-colors text-center"
          >
            <FaUser className="mx-auto mb-2" size={32} />
            <h3 className="font-semibold">Partner Preferences</h3>
            <p className="text-sm text-gray-500 mt-1">Match Preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Profile Edit Form
export const ProfileEditModal = ({ show, onClose, profileData, setProfileData, onSave, loading }) => {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar || null);

  // Sync avatar preview when profileData changes
  useEffect(() => {
    if (profileData.avatar) {
      setAvatarPreview(profileData.avatar);
    }
  }, [profileData.avatar]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarLoading(true);
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const url = await upload(file);
      
      if (url) {
        setProfileData({ ...profileData, avatar: url });
        setAvatarPreview(url);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Avatar Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                {avatarLoading ? (
                  <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                    <span className="text-gray-400">Uploading...</span>
                  </div>
                ) : avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FaUser className="text-3xl text-gray-400" />
                  </div>
                )}
              </div>
              {avatarLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="text-white text-xs">Uploading...</div>
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={avatarLoading}
                />
                <div className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-bgprimary transition-colors flex items-center gap-2">
                  <FaCamera />
                  {avatarLoading ? 'Uploading...' : profileData.avatar ? 'Change Photo' : 'Upload Photo'}
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={profileData.gender}
              onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={profileData.dob}
              onChange={(e) => setProfileData({...profileData, dob: e.target.value})}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              value={profileData.height}
              onChange={(e) => setProfileData({...profileData, height: e.target.value})}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              value={profileData.weight}
              onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
            <input
              type="text"
              value={profileData.education.occupation}
              onChange={(e) => setProfileData({
                ...profileData,
                education: {...profileData.education, occupation: e.target.value}
              })}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
            <input
              type="text"
              value={profileData.education.university}
              onChange={(e) => setProfileData({
                ...profileData,
                education: {...profileData.education, university: e.target.value}
              })}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Education Field</label>
            <input
              type="text"
              value={profileData.education.field}
              onChange={(e) => setProfileData({
                ...profileData,
                education: {...profileData.education, field: e.target.value}
              })}
              className="w-full border rounded-lg px-4 py-2 outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={onSave}
            disabled={loading || avatarLoading}
            className="flex-1 bg-primary text-white py-3 rounded-full font-medium hover:bg-bgprimary disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Onboarding Edit Modal
export const OnboardingEditModal = ({ 
  show, 
  onClose, 
  profileData, 
  setProfileData, 
  onboardingStep, 
  setOnboardingStep, 
  onboardingTotalSteps,
  onSave, 
  loading 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Edit Onboarding</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-2 transition-all duration-500"
              style={{ width: `${((onboardingStep + 1) / (onboardingTotalSteps + 1)) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-right">
            Step {onboardingStep + 1} of {onboardingTotalSteps + 1}
          </p>
        </div>

        {/* Step Components */}
        {onboardingStep === 0 && (
          <UserNameSection
            value={profileData.username}
            onChange={(val) => setProfileData({ ...profileData, username: val })}
          />
        )}
        {onboardingStep === 1 && (
          <GenderSection
            value={profileData.gender}
            onChange={(val) => setProfileData({ ...profileData, gender: val })}
          />
        )}
        {onboardingStep === 2 && (
          <DOBSection
            value={profileData.dob}
            onChange={(val) => setProfileData({ ...profileData, dob: val })}
          />
        )}
        {onboardingStep === 3 && (
          <HeightSection
            value={profileData.height}
            onChange={(val) => setProfileData({ ...profileData, height: val })}
          />
        )}
        {onboardingStep === 4 && (
          <WeightSection
            value={profileData.weight}
            onChange={(val) => setProfileData({ ...profileData, weight: val })}
          />
        )}
        {onboardingStep === 5 && (
          <BodyTypeSection
            value={profileData.bodyType}
            onChange={(val) => setProfileData({ ...profileData, bodyType: val })}
          />
        )}
        {onboardingStep === 6 && (
          <HealthSection
            value={profileData.healthInfo}
            onChange={(val) => setProfileData({ ...profileData, healthInfo: val })}
          />
        )}
        {onboardingStep === 7 && (
          <EducationSection
            value={profileData.education}
            onChange={(val) => setProfileData({ ...profileData, education: val })}
          />
        )}
        {onboardingStep === 8 && (
          <HobbiesSection
            value={profileData.hobbies}
            onChange={(val) => setProfileData({ ...profileData, hobbies: val })}
          />
        )}
        {onboardingStep === 9 && (
          <PhotosSection
            value={profileData.images}
            onChange={(val) => setProfileData({ ...profileData, images: val })}
          />
        )}
        {onboardingStep === 10 && (
          <Locationsection
            value={profileData.location}
            onChange={(val) => setProfileData({ ...profileData, location: val })}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            disabled={onboardingStep === 0}
            onClick={() => setOnboardingStep(prev => prev - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-2">
            {onboardingStep === onboardingTotalSteps ? (
              <button
                onClick={onSave}
                disabled={loading}
                className="px-6 py-2 rounded-full bg-primary text-white disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave /> {loading ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setOnboardingStep(prev => prev + 1)}
                className="px-6 py-2 rounded-full bg-primary text-white"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Partner Preferences Edit Modal
export const PartnerPreferencesEditModal = ({ 
  show, 
  onClose, 
  partnerData, 
  setPartnerData, 
  partnerStep, 
  setPartnerStep, 
  partnerTotalSteps,
  onSave, 
  loading 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800">Edit Partner Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-2 transition-all duration-500"
              style={{ width: `${((partnerStep + 1) / (partnerTotalSteps + 1)) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1 text-right">
            Step {partnerStep + 1} of {partnerTotalSteps + 1}
          </p>
        </div>

        {/* Step Components */}
        {partnerStep === 0 && <PartnerAge form={partnerData} setForm={setPartnerData} />}
        {partnerStep === 1 && <PartnerBody form={partnerData} setForm={setPartnerData} />}
        {partnerStep === 2 && <PartnerHealth form={partnerData} setForm={setPartnerData} />}
        {partnerStep === 3 && <PartnerHobbies form={partnerData} setForm={setPartnerData} />}
        {partnerStep === 4 && <PartnerLocation form={partnerData} setForm={setPartnerData} />}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            disabled={partnerStep === 0}
            onClick={() => setPartnerStep(prev => prev - 1)}
            className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            Back
          </button>
          <div className="flex gap-2">
            {partnerStep === partnerTotalSteps ? (
              <button
                onClick={onSave}
                disabled={loading}
                className="px-6 py-2 rounded-full bg-primary text-white disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave /> {loading ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button
                onClick={() => setPartnerStep(prev => prev + 1)}
                className="px-6 py-2 rounded-full bg-primary text-white"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

