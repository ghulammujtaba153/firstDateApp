import React from 'react'
import { FiArrowLeft, FiVideo, FiPhone } from 'react-icons/fi'

const ChatHeader = ({ 
  otherParticipant, 
  onInitiateCall
}) => {
  return (
    <>
      {/* Chat Header */}
      <div className="mb-3 md:mb-4 border-b border-gray-200 pb-2 md:pb-3 flex items-center gap-2 md:gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiArrowLeft size={22} className="text-gray-600" />
          </button>
          <img
            src={otherParticipant?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"}
            alt={otherParticipant?.username || "User"}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
          />
          <span className="text-base md:text-lg font-semibold truncate">
            {otherParticipant?.username || otherParticipant?.name || 'Unknown User'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onInitiateCall('audio')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Audio Call"
          >
            <FiPhone size={20} className="text-gray-500 hover:text-primary" />
          </button>
          <button 
            onClick={() => onInitiateCall('video')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Video Call"
          >
            <FiVideo size={20} className="text-gray-500 hover:text-primary" />
          </button>
        </div>
      </div>
    </>
  )
}

export default ChatHeader

