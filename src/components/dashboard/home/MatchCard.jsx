import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TiTick } from "react-icons/ti";
import { FaUser } from "react-icons/fa";
const MatchCard = ({ item, userLocation }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [locationName, setLocationName] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get user initial for avatar
  const getUserInitial = () => {
    return item.username ? item.username?.charAt(0).toUpperCase() : 'U';
  };

  // Get random background color based on user initial
  const getBackgroundColor = () => {
    const colors = [
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600'
    ];
    const index = getUserInitial().charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate distance using Haversine formula
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
    if (item.location && item.location.latitude && item.location.longitude) {
      // Only fetch if user location is not provided (so we need to show location name)
      if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        reverseGeocode(item.location.latitude, item.location.longitude);
      }
    }
  }, [item.location, userLocation]);

  // Get distance text
  const getDistanceText = () => {
    // If match has location object
    if (item.location && item.location.latitude && item.location.longitude) {
      // If user location is provided, calculate distance
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.location.latitude,
          item.location.longitude
        );
        return `${distance} km away`;
      }
      
      // If no user location, show city/town name or coordinates as fallback
      if (locationLoading) {
        return 'Loading location...';
      }
      if (locationName) {
        return locationName;
      }
      // Fallback to coordinates if geocoding failed
      return `${item.location.latitude.toFixed(2)}°, ${item.location.longitude.toFixed(2)}°`;
    }
    
    // Fallback to item.distance if available
    return item.distance || "Location unknown";
  };

  const AvatarPlaceholder = () => (
    <div className={`absolute inset-0 ${getBackgroundColor()} flex items-center justify-center`}>
      <div className="text-white flex flex-col items-center">
        <FaUser className="text-6xl opacity-80" />
        <span className="text-xl font-bold mt-2">{getUserInitial()}</span>
      </div>
    </div>
  );

  const handleCardClick = () => {
    const matchId = item.id || item._id;
    if (matchId) {
      navigate(`/dashboard/matches/${matchId}`);
    }
  };

  return (
    <div 
      className="relative w-full h-60 rounded-[30px] overflow-hidden shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Background Image or Icon Avatar */}
      {item.avatar || item.images.length>0 ? (
        <>
          <img
            src={item.avatar || item.images[0]}
            alt={item.username || "User"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {imageLoading && <AvatarPlaceholder />}
        </>
      ) : (
        <AvatarPlaceholder />
      )}

      {/* Overlay: dark bottom → light top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-white/30 group-hover:from-black/80 transition-all duration-300"></div>

      {/* Content on top of image */}
      <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-1">
          {item.username || "Unknown User"}
          {item.verified && (
            <TiTick className="text-primary bg-white rounded-full text-sm p-0.5" />
          )}
        </h3>
        <p className="text-sm">{getDistanceText()}</p>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300"></div>
    </div>
  )
}

export default MatchCard;