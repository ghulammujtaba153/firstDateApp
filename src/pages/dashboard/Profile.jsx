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
  FaCheckCircle,
  FaMoon,
  FaHammer,
  FaStar,
} from "react-icons/fa";

import { useAuth } from '../../context/authContext';
import { BASE_URL } from '../../config/url';
import axios from 'axios';
import ImagesCarousel from '../../components/dashboard/profile/ImagesCarousel';

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
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

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

  // Format DOB to readable date
  const formatDate = (dob) => {
    if (!dob) return '';
    const date = new Date(dob);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}, ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Reverse geocode coordinates to get city/town name
  const reverseGeocode = async (latitude, longitude) => {
    // Check if we already have this location cached
    const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
    const cached = sessionStorage.getItem(`location_${cacheKey}`);
    
    if (cached) {
      setLocationName(cached);
      return;
    }

    try {
      setLocationLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FirstDateApp/1.0' // Required by Nominatim
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Extract city/town name from address
      const address = data.address;
      let locationText = '';
      
      if (address.city) {
        locationText = address.city;
      } else if (address.town) {
        locationText = address.town;
      } else if (address.village) {
        locationText = address.village;
      } else if (address.municipality) {
        locationText = address.municipality;
      } else if (address.county) {
        locationText = address.county;
      } else if (address.state) {
        locationText = address.state;
      } else if (address.country) {
        locationText = address.country;
      }
      
      // If we have city/town, optionally add state/country for context
      if (locationText && address.state && locationText !== address.state) {
        locationText = `${locationText}, ${address.state}`;
      } else if (locationText && address.country && !address.state) {
        locationText = `${locationText}, ${address.country}`;
      }
      
      const finalLocation = locationText || 'Unknown location';
      setLocationName(finalLocation);
      
      // Cache the result
      sessionStorage.setItem(`location_${cacheKey}`, finalLocation);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName(null); // Fallback to coordinates
    } finally {
      setLocationLoading(false);
    }
  };

  // Fetch location name when coordinates are available
  useEffect(() => {
    if (user?.location?.latitude && user?.location?.longitude) {
      reverseGeocode(user.location.latitude, user.location.longitude);
    }
  }, [user?.location]);

  return (
    <>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
        {/* Header */}
        <div className=" px-6 py-4 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="bg-primary hover:bg-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="p-6">
          {/* Profile Image - Wide at top */}
          {user.avatar && <div className="relative mb-8">
            <img
              src={user.avatar || user.images[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=400&fit=crop&crop=center"}
              alt="Profile"
              className="w-full h-85 rounded-2xl object-cover shadow-lg"
            />
            
          </div>}

          {user.images && user.images.length > 0 && (
              <ImagesCarousel images={user.images}/>
            )}

          {/* All Details in Single Column */}
          <div className="space-y-2">

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6">

              <div className='flex flex-col gap-2'>

                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  {user?.username} {user.dob && `(${calculateAge(user.dob)})`} {user.verified && <FaCheckCircle className="text-primary" />}
                </h3>
                
              </div>






              <div className='flex itms-center gap-4'>
                {/* Gender */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaUser className="w-5 h-5" />
                  <span className="text-sm capitalize">{user.gender || "Not set"}</span>
                </div>
                {/* Age */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaBirthdayCake className="w-5 h-5" />
                  <span className="text-sm">{calculateAge(user.dob)} years</span>
                </div>

                {/* Height */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaRulerVertical className="w-5 h-5" />
                  <span className="text-sm">{user.height ? `${user.height} cm` : "Not set"}</span>
                </div>


              </div>

              <div className='flex itms-center gap-4'>

                {/* Religion */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaMoon className="w-5 h-5" />
                  <span className="text-sm">{user.religion || "Not set"}</span>
                </div>

                {/* Politics */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaHammer className="w-5 h-5" />
                  <span className="text-sm">{user.politics || "Not set"}</span>
                </div>

                {/* Occupation */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaBriefcase className="w-5 h-5" />
                  <span className="text-sm">{user.education?.occupation || "Not set"}</span>
                </div>



              </div>


              <div className='flex itms-center gap-4'>
                {/* University */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaUniversity className="w-5 h-5" />
                  <span className="text-sm">{user.education?.university || "Not set"}</span>
                </div>


                {/* Location */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span className="text-sm">
                    {locationLoading 
                      ? "Loading location..." 
                      : locationName 
                        ? locationName 
                        : user.location
                          ? `${user.location.latitude.toFixed(2)}, ${user.location.longitude.toFixed(2)}`
                          : "Not set"}
                  </span>
                </div>
              </div>





            </div>



            <div className='flex flex-col gap-2 p-6'>

              <h3 className="text-2xl font-bold mb-4 flex items-center">

                About Me
              </h3>
              <p className='text-sm text-gray-600 '> Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore impedit soluta in quia qui, est, iure illum quibusdam id placeat eum ratione, quis omnis aliquam quaerat ipsa? Hic, nostrum odio!</p>
              <div className='w-full h-[1px] bg-gray-200 mt-10'></div>
            </div>





            {/* Family & Beliefs */}
            <div className="grid grid-cols-1 gap-2">
              {/* Family Preferences */}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">

                  Kids or Family
                </h3>

                <div className="flex items-center gap-6 w-full">
                  {/* Do you have kids */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Do you have Kids?</span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {user.family?.haveKids ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="w-px h-5 bg-gray-400"></div>

                  {/* Do you want kids */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Do you want Kids?</span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {user.family?.wantKids ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>


              </div>
              <div className='w-full h-[1px] bg-gray-200 mt-10'></div>



            </div>

            {/* Chat Openers */}
            {user.chatOpeners && user.chatOpeners.length > 0 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Icebreakers</h2>
                <div className="space-y-4">
                  {user.chatOpeners.map((opener, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                      <p className="text-sm text-primary italic">{opener}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}




            {/* Body Type & Health */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Body Type */}
              <div className=" p-6">
                <h3 className="text-2xl font-bold  mb-4 flex items-center">

                  Body Type
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.bodyType && user.bodyType.length > 0 ? (
                    user.bodyType.map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 rounded-full text-gray-700 text-sm font-medium border border-gray-200"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No body type selected</span>
                  )}
                </div>
              </div>
              <div className='w-full h-[1px] bg-gray-200 mt-5'></div>

              {/* Health Info */}
              <div className=" p-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center">

                  Health Info
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.healthInfo && user.healthInfo.length > 0 ? (
                    user.healthInfo.map((item) => (
                      <span
                        key={item}
                        className="px-4 py-2 rounded-full text-gray-700 text-sm font-medium border border-gray-200"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No health info selected</span>
                  )}
                </div>
              </div>
              <div className='w-full h-[1px] bg-gray-200 mt-5'></div>
            </div>

            {/* Hobbies & Interests */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center">

                Hobbies & Interests
              </h2>
              <div className="flex flex-wrap gap-3">
                {user.hobbies && user.hobbies.length > 0 ? (
                  user.hobbies.map((item) => (
                    <span
                      key={item}
                      className="px-4 py-2 rounded-full text-gray-700 text-sm font-medium border border-gray-200"
                    >
                      {item.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No hobbies selected</span>
                )}
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