import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { useSocket } from '../../context/socketContext';
import { BASE_URL } from '../../config/url';
import axios from 'axios';
import Loader from '../common/Loader';

const ParticipantsGallery = ({ isOpen, onClose, eventId, event }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { onlineUsers } = useSocket();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId || !isOpen) return;

      try {
        setLoading(true);
        setError('');
        
        // If event object is passed and has participants, use it
        if (event && event.participants && Array.isArray(event.participants)) {
          // Check if participants are populated (have username/avatar) or just IDs
          const hasPopulatedData = event.participants.some(p => p.username || p.email);
          
          if (hasPopulatedData) {
            setParticipants(event.participants);
            setLoading(false);
            return;
          }
        }

        // Otherwise, fetch event details to get populated participants
        const response = await axios.get(`${BASE_URL}/api/events/${eventId}`);
        const eventData = response.data;
        
        if (eventData && eventData.participants) {
          setParticipants(eventData.participants);
        } else {
          setParticipants([]);
        }
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError('Failed to load participants. Please try again.');
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId, isOpen, event]);

  const handleParticipantClick = async (participant) => {
    if (!currentUser || !participant) {
      alert('Unable to start chat. Please try again.');
      return;
    }

    // Get participant ID (handle both populated and unpopulated participants)
    let participantId;
    if (typeof participant === 'string') {
      participantId = participant;
    } else if (participant._id) {
      participantId = participant._id.toString();
    } else {
      participantId = participant.toString();
    }

    const currentUserId = currentUser._id?.toString();
    
    if (!participantId || !currentUserId) {
      alert('Unable to start chat. Please try again.');
      return;
    }

    // Don't allow chatting with yourself
    if (participantId === currentUserId) {
      alert('You cannot chat with yourself.');
      return;
    }

    try {
      // Create or get chat room
      const response = await axios.post(`${BASE_URL}/api/chat/create`, {
        participants: [currentUserId, participantId]
      });

      const chat = response.data;

      // Navigate to chat room
      navigate('/dashboard/chats', {
        state: {
          chatId: chat._id,
          userId: participantId
        }
      });

      // Close the gallery modal
      onClose();
    } catch (err) {
      console.error('Error creating chat:', err);
      alert(err.response?.data?.error || 'Failed to start chat. Please try again.');
    }
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    const userIdStr = userId.toString();
    return onlineUsers.has(userIdStr);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Event Participants</h2>
            <p className="text-gray-600 mt-1">
              {event?.title && <span className="font-medium">{event.title}</span>}
              {participants.length > 0 && (
                <span className="ml-2">({participants.length} {participants.length === 1 ? 'participant' : 'participants'})</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  setLoading(true);
                  // Re-fetch will be triggered by useEffect
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">No participants yet.</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to join this event!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {participants.map((participant) => {
                // Handle both populated and unpopulated participants
                let participantId, username, avatar, email;
                
                if (typeof participant === 'string' || typeof participant === 'object' && !participant._id) {
                  // Unpopulated participant (just ID)
                  participantId = participant.toString();
                  username = 'User';
                  avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face";
                } else {
                  // Populated participant
                  participantId = participant._id?.toString() || participant.toString();
                  username = participant.username || participant.email?.split('@')[0] || 'User';
                  avatar = participant.avatar || participant.profilePicture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face";
                  email = participant.email;
                }

                const isOnline = isUserOnline(participantId);
                const isCurrentUser = participantId === currentUser?._id?.toString();

                return (
                  <div
                    key={participantId}
                    onClick={() => !isCurrentUser && handleParticipantClick(participant)}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all
                      ${isCurrentUser 
                        ? 'border-gray-300 bg-gray-50 cursor-default' 
                        : 'border-gray-200 hover:border-primary hover:shadow-lg cursor-pointer transform hover:scale-105'
                      }
                    `}
                  >
                    {/* Avatar with online indicator */}
                    <div className="relative mx-auto mb-3 w-20 h-20">
                      <img
                        src={avatar}
                        alt={username}
                        className="w-full h-full rounded-full object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face";
                        }}
                      />
                      {/* Online indicator - green dot with pulse animation */}
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm z-10">
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800 truncate" title={username}>
                        {isCurrentUser ? `${username} (You)` : username}
                      </p>
                      {isOnline && !isCurrentUser && (
                        <p className="text-xs text-green-600 mt-1 font-medium">● Online</p>
                      )}
                      {!isOnline && !isCurrentUser && (
                        <p className="text-xs text-gray-400 mt-1">Offline</p>
                      )}
                    </div>

                    {/* Click hint for non-current users */}
                    {!isCurrentUser && (
                      <div className="mt-2 text-center">
                        <p className="text-xs text-primary font-medium animate-pulse">Click to chat</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsGallery;

