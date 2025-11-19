import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TiTick } from "react-icons/ti";
import { FaUser } from "react-icons/fa";

const OPTMatchCard = ({ user, matchId, currentUserId, onAccept, onReject }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [locationName, setLocationName] = useState(null);

  console.log("OPTMatchCard user:", user);

  const getUserInitial = () => {
    return user?.username ? user.username.charAt(0).toUpperCase() : "U";
  };

  const getBackgroundColor = () => {
    const colors = [
      "bg-gradient-to-br from-purple-500 to-purple-600",
      "bg-gradient-to-br from-pink-500 to-pink-600",
      "bg-gradient-to-br from-blue-500 to-blue-600",
      "bg-gradient-to-br from-green-500 to-green-600",
      "bg-gradient-to-br from-orange-500 to-orange-600",
      "bg-gradient-to-br from-red-500 to-red-600",
      "bg-gradient-to-br from-teal-500 to-teal-600",
      "bg-gradient-to-br from-indigo-500 to-indigo-600",
    ];

    return colors[getUserInitial().charCodeAt(0) % colors.length];
  };

  const AvatarPlaceholder = () => (
    <div
      className={`absolute inset-0 ${getBackgroundColor()} flex items-center justify-center`}
    >
      <div className="text-white flex flex-col items-center">
        <FaUser className="text-6xl opacity-80" />
        <span className="text-xl font-bold mt-2">{getUserInitial()}</span>
      </div>
    </div>
  );

  const handleCardClick = () => {
    navigate(`/dashboard/matches/${matchId}`);
  };

  return (
    <div
      className="relative w-full h-60 rounded-[30px] overflow-hidden shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      {user?.images?.length > 0 && !imageError ? (
        <>
          <img
            src={user?.images?.[0]}
            alt={user?.username || "User"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? "opacity-0" : "opacity-100"
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-white/30"></div>

      {/* User Info */}
      <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-1">
          {user?.username || "Unknown User"}
          {user?.verified && (
            <TiTick className="text-primary bg-white rounded-full text-sm p-0.5" />
          )}
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm"
        >
          Accept
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReject();
          }}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default OPTMatchCard;
