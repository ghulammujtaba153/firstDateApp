import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FaArrowLeft,
  FaCommentDots,
  FaVideo,
} from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { useAuth } from '../../context/authContext';
import { BASE_URL } from '../../config/url';
import axios from 'axios';
import Loader from '../../components/common/Loader';
import ImagesCarousel from '../../components/dashboard/profile/ImagesCarousel';

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [matchUser, setMatchUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [checkingLike, setCheckingLike] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    const fetchMatchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Try to fetch user by ID
        const response = await axios.get(`${BASE_URL}/api/auth/${id}`);
        setMatchUser(response.data);
        
        // Fetch location name if coordinates are available
        if (response.data.location?.latitude && response.data.location?.longitude) {
          reverseGeocode(response.data.location.latitude, response.data.location.longitude);
        }
      } catch (error) {
        console.error('Error fetching match details:', error);
        setError('Failed to load match details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMatchDetail();
    }
  }, [id]);

  // Check if current user has liked this profile
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUser?._id || !id) return;

      try {
        setCheckingLike(true);
        const response = await axios.get(
          `${BASE_URL}/api/likes/check/${id}?likerUserId=${currentUser._id}`
        );
        setIsLiked(response.data.isLiked || false);
      } catch (error) {
        console.error('Error checking like status:', error);
        setIsLiked(false);
      } finally {
        setCheckingLike(false);
      }
    };

    if (currentUser?._id && id) {
      checkLikeStatus();
    }
  }, [currentUser?._id, id]);

  // Reverse geocode coordinates to get city/town name
  const reverseGeocode = async (latitude, longitude) => {
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
            'User-Agent': 'FirstDateApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
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
      
      if (locationText && address.state && locationText !== address.state) {
        locationText = `${locationText}, ${address.state}`;
      } else if (locationText && address.country && !address.state) {
        locationText = `${locationText}, ${address.country}`;
      }
      
      const finalLocation = locationText || 'Unknown location';
      setLocationName(finalLocation);
      sessionStorage.setItem(`location_${cacheKey}`, finalLocation);
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocationName(null);
    } finally {
      setLocationLoading(false);
    }
  };

  // Calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance.toFixed(1);
  };

  const getDistance = () => {
    if (!matchUser?.location || !currentUser?.location) return null;
    
    if (matchUser.location.latitude && matchUser.location.longitude &&
        currentUser.location.latitude && currentUser.location.longitude) {
      return calculateDistance(
        currentUser.location.latitude,
        currentUser.location.longitude,
        matchUser.location.latitude,
        matchUser.location.longitude
      );
    }
    return null;
  };

  // Calculate age from DOB (used in UI)
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

  const handleLike = async () => {
    if (!currentUser?._id || !id || liking) return;

    try {
      setLiking(true);
      
      if (isLiked) {
        // Unlike the user
        await axios.delete(`${BASE_URL}/api/likes`, {
          data: {
            likerUserId: currentUser._id,
            likedUserId: id
          }
        });
        setIsLiked(false);
      } else {
        // Like the user
        await axios.post(`${BASE_URL}/api/likes`, {
          likerUserId: currentUser._id,
          likedUserId: id
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking/unliking user:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update like. Please try again.';
      alert(errorMessage);
    } finally {
      setLiking(false);
    }
  };

  const handleChat = async () => {
    if (!currentUser?._id || !id || creatingChat) return;

    try {
      setCreatingChat(true);
      
      // Create or get chat room
      const response = await axios.post(`${BASE_URL}/api/chat/create`, {
        participants: [currentUser._id, id]
      });

      // Navigate to chats page with the chat ID
      navigate('/dashboard/chats', { state: { chatId: response.data._id, userId: id } });
    } catch (error) {
      console.error('Error creating chat:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create chat. Please try again.';
      alert(errorMessage);
    } finally {
      setCreatingChat(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !matchUser) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-6">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {error || 'Match not found'}
          </h3>
          <button
            onClick={() => navigate('/dashboard/matches')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-bgprimary"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const distance = getDistance();

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-blue-50 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/matches')}
          className="p-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <FaArrowLeft className="text-gray-700" size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Match Details</h1>
      </div>


      



              <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative">
       

        <div className="p-6">
          {/* Profile Image - Wide at top */}
          {matchUser?.avatar && (
            <div className="relative mb-8">
              <img
                src={matchUser.avatar || (matchUser.images && matchUser.images[0]) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=400&fit=crop&crop=center"}
                alt="Profile"
                className="w-full h-85 rounded-2xl object-cover shadow-lg"
              />
            </div>
          )}

          {matchUser?.images && matchUser.images.length > 0 && (
            <ImagesCarousel images={matchUser.images} />
          )}

          {/* All Details in Single Column */}
          <div className="space-y-2">

            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6">

              <div className='flex flex-col gap-2'>

                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  {matchUser?.username} {matchUser?.dob && `(${calculateAge(matchUser.dob)})`} {matchUser?.verified && <FaCheckCircle className="text-primary" />}
                </h3>
                
              </div>






              <div className='flex itms-center gap-4'>
                {/* Gender */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaUser className="w-5 h-5" />
                  <span className="text-sm capitalize">{matchUser?.gender || "Not set"}</span>
                </div>
                {/* Age */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaBirthdayCake className="w-5 h-5" />
                  <span className="text-sm">{calculateAge(matchUser?.dob)} years</span>
                </div>

                {/* Height */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaRulerVertical className="w-5 h-5" />
                  <span className="text-sm">{matchUser?.height ? `${matchUser.height} cm` : "Not set"}</span>
                </div>


              </div>

              <div className='flex itms-center gap-4'>

                {/* Religion */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaMoon className="w-5 h-5" />
                  <span className="text-sm">{matchUser?.religion || "Not set"}</span>
                </div>

                {/* Politics */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaHammer className="w-5 h-5" />
                  <span className="text-sm">{matchUser?.politics || "Not set"}</span>
                </div>

                {/* Occupation */}
                <div className="flex items-center text-gray-600 gap-3">
                  <FaBriefcase className="w-5 h-5" />
                  <span className="text-sm">{matchUser?.education?.occupation || "Not set"}</span>
                </div>



              </div>


              <div className='flex itms-center gap-4'>
                {/* University */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaUniversity className="w-5 h-5" />
                  <span className="text-sm">{matchUser?.education?.university || "Not set"}</span>
                </div>


                {/* Location */}
                <div className="flex items-center text-gray-600 gap-3 ">
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span className="text-sm">
                    {locationLoading 
                      ? "Loading location..." 
                      : locationName 
                        ? locationName 
                        : matchUser?.location
                          ? `${matchUser.location.latitude.toFixed(2)}, ${matchUser.location.longitude.toFixed(2)}`
                          : "Not set"}
                    {distance ? <span className="ml-2 text-sm text-gray-500">· {distance} km away</span> : null}
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
                      {matchUser?.family?.haveKids ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="w-px h-5 bg-gray-400"></div>

                  {/* Do you want kids */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Do you want Kids?</span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {matchUser?.family?.wantKids ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>


              </div>
              <div className='w-full h-[1px] bg-gray-200 mt-10'></div>



            </div>

            {/* Chat Openers */}
            {matchUser?.chatOpeners && matchUser.chatOpeners.length > 0 && (
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Icebreakers</h2>
                <div className="space-y-4">
                  {matchUser.chatOpeners.map((opener, index) => (
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
                  {matchUser?.bodyType && matchUser.bodyType.length > 0 ? (
                    matchUser.bodyType.map((item) => (
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
                  {matchUser?.healthInfo && matchUser.healthInfo.length > 0 ? (
                    matchUser.healthInfo.map((item) => (
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
                {matchUser?.hobbies && matchUser.hobbies.length > 0 ? (
                  matchUser.hobbies.map((item) => (
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

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleLike}
                  disabled={liking || checkingLike || !currentUser?._id}
                  className={`flex-1 py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors ${
                    isLiked 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-primary text-white hover:bg-bgprimary'
                  } ${(liking || checkingLike || !currentUser?._id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaHeart /> {liking ? 'Liking...' : isLiked ? 'Liked' : 'Like'}
                </button>
                <button 
                  onClick={handleChat}
                  disabled={creatingChat || !currentUser?._id}
                  className="p-3 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Start Chat"
                >
                  <FaCommentDots />
                </button>
                <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50">
                  <FaPhone />
                </button>
                <button className="p-3 border border-gray-300 rounded-full hover:bg-gray-50">
                  <FaVideo />
                </button>
              </div>
            </div>


          </div>
        </div>
      </div>

      
    </div>
  );
};

export default MatchDetail;

