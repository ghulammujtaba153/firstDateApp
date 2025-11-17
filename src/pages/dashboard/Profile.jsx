import React, { useState, useEffect } from 'react';
import {
  FaUser,
  FaBirthdayCake,
  FaBriefcase,
  FaGraduationCap,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhone,
  FaHeart,
  FaRunning,
  FaSmoking,
  FaChild,
  FaUniversity,
  FaBook,
  FaRulerVertical,
} from "react-icons/fa";

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

const Profile = () => {
  const { user, setUser, token } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMode, setEditMode] = useState(null);
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
    location: '',
    phone: '',
    politics: '',
    religion: '',
    family: {
      haveKids: false,
      wantKids: false
    },
    chatOpeners: []
  });

  // Partner preferences edit state
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
        location: user.location ? `${user.location.latitude}, ${user.location.longitude}` : '',
        phone: user.phone || '',
        politics: user.politics || '',
        religion: user.religion || '',
        family: user.family || { haveKids: false, wantKids: false },
        chatOpeners: user.chatOpeners || []
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

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'Not set';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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
          {/* Profile Image - Wide at top */}
          <div className="relative mb-8">
            <img
              src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=400&fit=crop&crop=center"}
              alt="Profile"
              className="w-full h-85 rounded-2xl object-cover shadow-lg"
            />
            {user.images && user.images.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
                <span className="text-sm font-medium text-gray-600">{user.images.length} photos</span>
              </div>
            )}
          </div>

          {/* All Details in Single Column */}
          <div className="space-y-8">

            {/* Basic Information */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaUser className=" w-5 h-5" />
                  <span className="text-sm">{user.username || "Not set"}</span>
                </div>

                {/* Gender */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaUser className="w-5 h-5" />
                  <span className="text-sm capitalize">{user.gender || "Not set"}</span>
                </div>

                {/* Age */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaBirthdayCake className="w-5 h-5" />
                  <span className="text-sm">{calculateAge(user.dob)} years</span>
                </div>

                {/* Height */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaRulerVertical className="w-5 h-5" />
                  <span className="text-sm">{user.height ? `${user.height} cm` : "Not set"}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaPhone className="w-5 h-5" />
                  <span className="text-sm">{user.phone || "Not set"}</span>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span className="text-sm">
                    {user.location
                      ? `${user.location.latitude}, ${user.location.longitude}`
                      : "Not set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Education & Career */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaGraduationCap className="w-5 h-5 mr-2" />
                Education & Career
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Occupation */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaBriefcase className=" w-5 h-5" />
                  <span className="text-sm">{user.education?.occupation || "Not set"}</span>
                </div>

                {/* University */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaUniversity className="w-5 h-5" />
                  <span className="text-sm">{user.education?.university || "Not set"}</span>
                </div>

                {/* Field */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaBook className="w-5 h-5" />
                  <span className="text-sm">{user.education?.field || "Not set"}</span>
                </div>
              </div>
            </div>


            {/* Body Type & Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Body Type */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaRunning className="w-5 h-5 mr-2" />
                  Body Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.bodyType && user.bodyType.length > 0 ? (
                    user.bodyType.map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No body type selected</span>
                  )}
                </div>
              </div>

              {/* Health Info */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaSmoking className="w-5 h-5 mr-2" />
                  Health Info
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.healthInfo && user.healthInfo.length > 0 ? (
                    user.healthInfo.map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No health info selected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Hobbies & Interests */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaHeart className="w-5 h-5 mr-2" />
                Hobbies & Interests
              </h2>
              <div className="flex flex-wrap gap-3">
                {user.hobbies && user.hobbies.length > 0 ? (
                  user.hobbies.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-2 rounded-full bg-pink-50 text-pink-700 text-sm font-medium border border-pink-200"
                    >
                      {item.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No hobbies selected</span>
                )}
              </div>
            </div>

            {/* Family & Beliefs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Family Preferences */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaChild className="w-5 h-5 mr-2" />
                  Family Preferences
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Has Kids:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.family?.haveKids
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.family?.haveKids ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Wants Kids:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.family?.wantKids
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {user.family?.wantKids ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Beliefs & Values */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaInfoCircle className="w-5 h-5 mr-2" />
                  Beliefs & Values
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Religion:</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium capitalize">
                      {user.religion || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Politics:</span>
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium capitalize">
                      {user.politics || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Openers */}
            {user.chatOpeners && user.chatOpeners.length > 0 && (
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Openers</h2>
                <div className="space-y-4">
                  {user.chatOpeners.map((opener, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                      <p className="text-sm text-gray-700 italic">"{opener}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

      <PartnerPreferencesEditModal
        show={editMode === 'partner'}
        onClose={() => {
          setEditMode(null);
          setShowEditModal(false);
        }}
        partnerData={partnerData}
        setPartnerData={setPartnerData}
        onSave={handleSavePartner}
        loading={loading}
      />
    </>
  );
};

export default Profile;