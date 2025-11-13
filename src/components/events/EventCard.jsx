import React from 'react'
import { FaCalendar } from 'react-icons/fa6'

const EventCard = ({ 
  item, 
  isJoined = false, 
  onJoin, 
  onLeave, 
  isLoading = false,
  getEventDate,
  getEventTime,
  onViewGallery,
  onFeedback
}) => {
  const eventDate = getEventDate ? getEventDate(item) : (item.date || item.startDate);
  const eventTime = getEventTime ? getEventTime(item) : (item.time || "");
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Date TBA";
      return date.toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Date TBA";
    }
  };

  // Get participants count
  const participantsCount = Array.isArray(item.participants) ? item.participants.length : 0;
  const maxSlots = item.maxSlots || 0;
  const isFull = maxSlots > 0 && participantsCount >= maxSlots;

  return (
    <div className="bg-gray-50 p-4 rounded-[20px] shadow-md h-full flex flex-col">
      {/* Image with overlay */}
      <div className="relative overflow-hidden">
        <img
          src={item.image || "/event-1.png"}
          alt={item.title}
          className="w-full h-[150px] object-cover rounded-[20px]"
          onError={(e) => {
            e.target.src = "/event-1.png";
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/30 p-2 rounded-[20px]">
          {isJoined ? (
            <p className="bg-green-500/90 w-[120px] text-center text-white text-sm font-medium rounded-lg px-3 py-1 shadow">
              Joined
            </p>
          ) : isFull ? (
            <p className="bg-red-500/90 w-[100px] text-center text-white text-sm font-medium rounded-lg px-3 py-1 shadow">
              Full
            </p>
          ) : (
            <p className="bg-white/90 w-[100px] text-center text-black text-sm font-medium rounded-lg px-3 py-1 shadow">
              {item.status === 'upcoming' ? 'Upcoming' : 'Available'}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 mt-3 flex-1">
        {/* Title - Fixed height */}
        <h1 className="text-lg font-semibold line-clamp-2 h-14 overflow-hidden">
          {item.title || "Event"}
        </h1>

        {/* Description - Fixed height, always show space */}
        <div className="h-10 overflow-hidden">
          {item.description ? (
            <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
          ) : (
            <p className="text-gray-400 text-sm line-clamp-2">&nbsp;</p>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm">
          <FaCalendar className="mr-2" />
          <div className="flex flex-col">
            <span>{formatDate(eventDate)}</span>
            {eventTime && (
              <span className="text-xs">{eventTime}</span>
            )}
          </div>
        </div>

        {/* Event Type */}
        {item.type && (
          <div className="flex items-center gap-2">
            <img
              src="/diamond.png"
              alt="Event icon"
              className="w-4 h-4 rounded-full"
            />
            <p className="text-gray-600 text-sm">{item.type}</p>
          </div>
        )}

        {/* Participants Info */}
        {maxSlots > 0 && (
          <div className="text-xs text-gray-500">
            {participantsCount} / {maxSlots} participants
          </div>
        )}

        {/* Price */}
        <div className="text-lg font-bold text-primary">
          ${(item.price || 0).toFixed(2)}
        </div>

        {/* View Gallery Button - Only show if user has joined and event has participants */}
        {isJoined && participantsCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewGallery) {
                onViewGallery(item);
              }
            }}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-center hover:bg-gray-300 transition text-sm font-medium mb-2"
          >
            👥 View Gallery ({participantsCount})
          </button>
        )}

        {/* Feedback Button - Only show if user has joined */}
        {isJoined && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onFeedback) {
                onFeedback(item);
              }
            }}
            className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-center hover:bg-blue-200 transition text-sm font-medium mb-2"
          >
            ⭐ Give Feedback
          </button>
        )}

        {/* Action Button - Push to bottom */}
        <div className="mt-auto pt-2">
          {isJoined ? (
            <button
              onClick={onLeave}
              disabled={isLoading}
              className="bg-red-500 text-white px-4 py-2 rounded-full text-center w-full hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Leaving..." : "Leave Event"}
            </button>
          ) : (
            <button
              onClick={onJoin}
              disabled={isLoading || isFull || item.status === 'closed' || item.status === 'completed'}
              className="bg-primary text-white px-4 py-2 rounded-full text-center w-full hover:bg-transparent hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? "Joining..." 
                : isFull 
                  ? "Event Full" 
                  : item.status === 'closed' || item.status === 'completed'
                    ? "Event Closed"
                    : (item.price || 0) > 0
                      ? `Pay $${(item.price || 0).toFixed(2)}`
                      : "Join Event"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard
