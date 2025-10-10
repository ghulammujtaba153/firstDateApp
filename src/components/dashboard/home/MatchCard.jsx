import React, { useState } from 'react'
import { TiTick } from "react-icons/ti";
import { FaUser, FaUserCircle, FaRegUserCircle, FaUserAlt } from "react-icons/fa";
import { IoPersonCircle } from "react-icons/io5";

const MatchCard = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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

  const AvatarPlaceholder = () => (
    <div className={`absolute inset-0 ${getBackgroundColor()} flex items-center justify-center`}>
      <div className="text-white flex flex-col items-center">
        <FaUser className="text-6xl opacity-80" />
        <span className="text-xl font-bold mt-2">{getUserInitial()}</span>
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-60 rounded-[30px] overflow-hidden shadow group cursor-pointer">
      {/* Background Image or Icon Avatar */}
      {item.avatar && !imageError ? (
        <>
          <img
            src={item.avatar}
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
        <p className="text-sm">{item.distance || "Location unknown"}</p>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-all duration-300"></div>
    </div>
  )
}

export default MatchCard