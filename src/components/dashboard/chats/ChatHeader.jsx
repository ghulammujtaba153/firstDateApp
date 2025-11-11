import React from 'react'
import { FiArrowLeft, FiVideo, FiPhone } from 'react-icons/fi'

const ChatHeader = ({ 
  otherParticipant, 
  callState, 
  onInitiateCall,
  incomingCall,
  onAnswerCall,
  onRejectCall
}) => {
  return (
    <>
      {/* Incoming Call Modal */}
      {incomingCall && callState === 'ringing' && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <img
                src={otherParticipant?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"}
                alt={otherParticipant?.username || "User"}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {incomingCall.callType === 'video' ? '📹 Video' : '📞 Audio'} Call
              </h3>
              <p className="text-lg text-gray-600">
                {otherParticipant?.username || 'Unknown User'} is calling...
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={onRejectCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <FiPhone size={20} className="rotate-135" />
                Decline
              </button>
              <button
                onClick={onAnswerCall}
                className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <FiPhone size={20} />
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

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
            disabled={callState === 'calling'}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Audio Call"
          >
            <FiPhone size={20} className={`${callState === 'calling' ? 'text-primary animate-pulse' : 'text-gray-500 hover:text-primary'}`} />
          </button>
          <button 
            onClick={() => onInitiateCall('video')}
            disabled={callState === 'calling'}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Video Call"
          >
            <FiVideo size={20} className={`${callState === 'calling' ? 'text-primary animate-pulse' : 'text-gray-500 hover:text-primary'}`} />
          </button>
        </div>
      </div>
    </>
  )
}

export default ChatHeader

