import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaUser, 
  FaRuler, 
  FaBirthdayCake, 
  FaBriefcase, 
  FaGraduationCap, 
  FaMapMarkerAlt, 
  FaInfoCircle,
  FaPhone,
  FaVideo,
  FaHeart,
  FaCommentDots
} from 'react-icons/fa';
import { TiTick } from "react-icons/ti";
import { useAuth } from '../../context/authContext';
import { BASE_URL } from '../../config/url';
import axios from 'axios';
import Loader from '../../components/common/Loader';

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

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Image & Basic Info */}
          <div className="lg:col-span-1">
            <div className="relative mb-6">
              <img 
                src={matchUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"} 
                alt={matchUser.username || "Profile"} 
                className="w-full aspect-square rounded-2xl object-cover shadow-lg"
              />
              {matchUser.images && matchUser.images.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-white rounded-lg px-2 py-1 shadow-md">
                  <span className="text-xs font-medium text-gray-600">{matchUser.images.length} photos</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  {matchUser.username || 'Unknown User'}
                  {matchUser.verified && (
                    <TiTick className="text-primary bg-white rounded-full text-sm p-0.5" />
                  )}
                </h2>
              </div>

              {distance && (
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                  <span className="text-sm">{distance} km away</span>
                </div>
              )}

              {locationName && (
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                  <span className="text-sm">{locationName}</span>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <FaUser className="w-4 h-4 mr-2" />
                <span className="text-sm">{matchUser.gender || 'Not set'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <FaRuler className="w-4 h-4 mr-2" />
                <span className="text-sm">{matchUser.height ? `${matchUser.height} cm` : 'Not set'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <FaBriefcase className="w-4 h-4 mr-2" />
                <span className="text-sm">{matchUser.education?.occupation || 'Not set'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <FaGraduationCap className="w-4 h-4 mr-2" />
                <span className="text-sm">{matchUser.education?.university || 'Not set'}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <FaBirthdayCake className="w-4 h-4 mr-2" />
                <span className="text-sm">{matchUser.dob || 'Not set'}</span>
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

          {/* Middle Column */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Education Field</h3>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <FaInfoCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {matchUser.education?.field || "No education field provided yet."}
              </p>
            </div>

            {/* Body Type */}
            <div className="mb-6">
              <h3 className="text-md font-semibold text-gray-800 mb-2">Body Type</h3>
              <div className="flex flex-wrap gap-2">
                {matchUser.bodyType && matchUser.bodyType.length > 0 ? (
                  matchUser.bodyType.map((item) => (
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

            {/* Photo Gallery */}
            {matchUser.images && matchUser.images.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-800 mb-4">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                  {matchUser.images.slice(0, 6).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Photo ${index + 1}`}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
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
                {matchUser.healthInfo && matchUser.healthInfo.length > 0 ? (
                  matchUser.healthInfo.map((item) => (
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
            <div>
              <h3 className="text-md font-semibold text-gray-800 mb-2">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {matchUser.hobbies && matchUser.hobbies.length > 0 ? (
                  matchUser.hobbies.map((item) => (
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
  );
};

export default MatchDetail;

