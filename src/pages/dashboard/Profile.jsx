import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaRuler, 
  FaBirthdayCake, 
  FaBriefcase, 
  FaGraduationCap, 
  FaInfoCircle
} from 'react-icons/fa';
import { useAuth } from '../../context/authContext';
import { BASE_URL } from '../../config/url';
import axios from 'axios';

// Import modal components
import {
  EditOptionsModal,
  ProfileEditModal,
  OnboardingEditModal,
  PartnerPreferencesEditModal
} from '../../components/dashboard/profile/EditProfileModals';

const hobbies =[
  "Traveling", "Cooking", "Reading", "Hiking", "Photography", "Music", "Dancing", "Gaming"
]

const health = [
  "Non-smoker", "No drugs", "No pets", "No kids", "Vegetarian"
]

const body= [
  "Slim", "Athletic", "Average", "Curvy", "Muscular"
]

const Profile = () => {
  const { user, setUser, token } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState(null); // 'profile', 'onboarding', 'partner'
  const [loading, setLoading] = useState(false);

  // Profile edit state
  const [profileData, setProfileData] = useState({
    username: '',
    gender: '',
    dob: '',
    height: '',
    weight: '',
    avatar: '',
    bodyType: [],
    healthInfo: [],
    hobbies: [],
    education: {
      field: '',
      occupation: '',
      university: ''
    },
    images: [],
    location: ''
  });

  // Onboarding edit state
  const [onboardingStep, setOnboardingStep] = useState(0);
  const onboardingTotalSteps = 10;

  // Partner preferences edit state
  const [partnerStep, setPartnerStep] = useState(0);
  const partnerTotalSteps = 4;
  const [partnerData, setPartnerData] = useState({
    partnerAge: { min: 18, max: 30 },
    partnerBodyType: [],
    partnerHealth: [],
    partnerHobbies: [],
    partnerLocation: ""
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        gender: user.gender || '',
        dob: user.dob || '',
        height: user.height || '',
        weight: user.weight || '',
        avatar: user.avatar || '',
        bodyType: user.bodyType || [],
        healthInfo: user.healthInfo || [],
        hobbies: user.hobbies || [],
        education: {
          field: user.education?.field || '',
          occupation: user.education?.occupation || '',
          university: user.education?.university || ''
        },
        images: user.images || [],
        location: user.location || ''
      });

      setPartnerData({
        partnerAge: user.partnerAge || { min: 18, max: 30 },
        partnerBodyType: user.partnerBodyType || [],
        partnerHealth: user.partnerHealth || [],
        partnerHobbies: user.partnerHobbies || [],
        partnerLocation: user.partnerLocation || ""
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const updateData = {
        ...profileData,
        height: profileData.height ? Number(profileData.height) : undefined,
        weight: profileData.weight ? Number(profileData.weight) : undefined
      };
      const response = await axios.put(
        `${BASE_URL}/api/auth/${user._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setEditMode(null);
      setShowEditModal(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnboarding = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/onboarding/${user._id}`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setEditMode(null);
      setShowEditModal(false);
      alert('Onboarding data updated successfully!');
    } catch (error) {
      console.error('Error updating onboarding:', error);
      alert('Failed to update onboarding data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartner = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/onboarding/${user._id}`,
        partnerData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      setEditMode(null);
      setShowEditModal(false);
      alert('Partner preferences updated successfully!');
    } catch (error) {
      console.error('Error updating partner preferences:', error);
      alert('Failed to update partner preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 to-blue-50 px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
          <button 
            onClick={() => setShowEditModal(true)}
            className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <div className="relative">
              <img 
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"} 
                alt="Profile" 
                className="w-full aspect-square rounded-2xl object-cover shadow-lg"
              />
              {user.images && user.images.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg px-2 py-1 shadow-md">
                  <span className="text-xs font-medium text-gray-600">{user.images.length} photos</span>
                </div>
              )}
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center text-gray-600">
                <FaUser className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.username || 'Not set'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaUser className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.gender || 'Not set'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaRuler className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.height ? `${user.height} cm` : 'Not set'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaBriefcase className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.education?.occupation || 'Not set'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaGraduationCap className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.education?.university || 'Not set'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaBirthdayCake className="w-4 h-4 mr-2" />
                <span className="text-sm">{user.dob || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Education Field</h3>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FaInfoCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {user.education?.field || "No education field provided yet."}
              </p>
            </div>

            {/* Body Type */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Body Type</h3>
              <div className="flex flex-wrap gap-2">
                {user.bodyType && user.bodyType.length > 0 ? (
                  user.bodyType.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No body type selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Health Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Health Info</h3>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FaInfoCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.healthInfo && user.healthInfo.length > 0 ? (
                  user.healthInfo.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No health info selected</span>
                )}
              </div>
            </div>

            {/* Hobbies */}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {user.hobbies && user.hobbies.length > 0 ? (
                  user.hobbies.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium border border-pink-200"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No hobbies selected</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Edit Modals */}
    <EditOptionsModal
      show={showEditModal && !editMode}
      onClose={() => setShowEditModal(false)}
      onSelectOption={(mode) => setEditMode(mode)}
    />

    <ProfileEditModal
      show={editMode === 'profile'}
      onClose={() => {
        setEditMode(null);
        setShowEditModal(false);
      }}
      profileData={profileData}
      setProfileData={setProfileData}
      onSave={handleSaveProfile}
      loading={loading}
    />

    <OnboardingEditModal
      show={editMode === 'onboarding'}
      onClose={() => {
        setEditMode(null);
        setShowEditModal(false);
      }}
      profileData={profileData}
      setProfileData={setProfileData}
      onboardingStep={onboardingStep}
      setOnboardingStep={setOnboardingStep}
      onboardingTotalSteps={onboardingTotalSteps}
      onSave={handleSaveOnboarding}
      loading={loading}
    />

    <PartnerPreferencesEditModal
      show={editMode === 'partner'}
      onClose={() => {
        setEditMode(null);
        setShowEditModal(false);
      }}
      partnerData={partnerData}
      setPartnerData={setPartnerData}
      partnerStep={partnerStep}
      setPartnerStep={setPartnerStep}
      partnerTotalSteps={partnerTotalSteps}
      onSave={handleSavePartner}
      loading={loading}
    />
    </>
  );
};

export default Profile;
