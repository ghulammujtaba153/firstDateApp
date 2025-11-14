import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/authContext'
import { useSocket } from '../../../context/socketContext'
import { BASE_URL } from '../../../config/url'
import axios from 'axios'
import { FiPhone, FiPhoneOff, FiPhoneCall } from 'react-icons/fi'

const GlobalCallContainer = () => {
  const { user: currentUser } = useAuth()
  const { socket, isConnected } = useSocket()
  const navigate = useNavigate()
  const [incomingCall, setIncomingCall] = useState(null)
  const [callerInfo, setCallerInfo] = useState(null)
  const incomingCallChatRef = useRef(null)
  const ringtoneRef = useRef(null)
  const incomingCallRef = useRef(null) // Ref to track current call for socket handlers

  // Initialize ringtone audio
  useEffect(() => {
    ringtoneRef.current = new Audio('/ring.mp3')
    ringtoneRef.current.loop = true
    ringtoneRef.current.volume = 0.7 // Set volume to 70%

    // Cleanup on unmount
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause()
        ringtoneRef.current.currentTime = 0
        ringtoneRef.current = null
      }
    }
  }, [])

  // Fetch caller information when call arrives
  const fetchCallerInfo = useCallback(async (callerId) => {
    if (!callerId || !currentUser?._id) return null

    try {
      // Try to find chat with caller
      const response = await axios.get(`${BASE_URL}/api/chat/user/${currentUser._id}`)
      const chats = response.data || []
      
      const chatWithCaller = chats.find(chat => 
        chat.participants?.some(p => {
          const participantId = p._id?.toString() || p?.toString()
          return participantId === callerId
        })
      )

      if (chatWithCaller) {
        incomingCallChatRef.current = chatWithCaller
        const caller = chatWithCaller.participants?.find(p => {
          const participantId = p._id?.toString() || p?.toString()
          return participantId === callerId
        })
        return caller || null
      }

      // If no chat found, try to fetch user info directly
      try {
        const userResponse = await axios.get(`${BASE_URL}/api/auth/${callerId}`)
        return userResponse.data
      } catch (error) {
        console.error('Error fetching caller info:', error)
        return null
      }
    } catch (error) {
      console.error('Error fetching caller info:', error)
      return null
    }
  }, [currentUser?._id])

  // Stop ringtone (defined before clearCallState to avoid hoisting issues)
  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause()
      ringtoneRef.current.currentTime = 0
    }
  }, [])

  // Clear call state helper
  const clearCallState = useCallback(() => {
    stopRingtone()
    setIncomingCall(null)
    setCallerInfo(null)
    incomingCallChatRef.current = null
    incomingCallRef.current = null // Clear ref as well
  }, [stopRingtone])

  // Listen for incoming calls and call responses
  useEffect(() => {
    if (!socket || !isConnected || !currentUser?._id) return

    const handleCallInvite = async (data) => {
      console.log('Global call invite received:', data)
      const { from, callType, channelName, callId } = data

      if (!from || !callType || !channelName || !callId) {
        console.warn('Invalid call invite data:', data)
        return
      }

      // Fetch caller information
      const caller = await fetchCallerInfo(from?.toString())
      setCallerInfo(caller)

      // Set incoming call state
      const callState = {
        from,
        callType,
        channelName,
        callId
      }
      setIncomingCall(callState)
      incomingCallRef.current = callState // Update ref for socket handlers

      // Play ringtone
      if (ringtoneRef.current) {
        ringtoneRef.current.play().catch(error => {
          console.error('Error playing ringtone:', error)
        })
      }
    }

    // Handle call responses (reject, end, cancel)
    const handleCallResponse = (data) => {
      const { from, responseType, callId, callData } = data
      
      // Get the callId from callData if not directly in data
      const actualCallId = callId || callData?.callId
      
      // Use ref to get current call state (avoids dependency issues)
      const currentCall = incomingCallRef.current
      
      // If caller cancelled/rejected/ended the call, dismiss the incoming call UI
      // Check if this response matches our current incoming call
      if (currentCall && actualCallId === currentCall.callId) {
        if (responseType === 'call_reject' || responseType === 'call_end' || responseType === 'call_cancel') {
          console.log('Call cancelled/ended by other user:', responseType)
          clearCallState()
        }
      }
    }

    socket.on('call:invite', handleCallInvite)
    socket.on('call:response', handleCallResponse)

    return () => {
      socket.off('call:invite', handleCallInvite)
      socket.off('call:response', handleCallResponse)
    }
  }, [socket, isConnected, currentUser?._id, fetchCallerInfo, clearCallState])

  // Handle call response
  const sendCallResponse = useCallback((responseType) => {
    if (!socket || !isConnected || !incomingCall) return false

    try {
      socket.emit('call:response', {
        toUserId: incomingCall.from?.toString(),
        responseType,
        callData: {
          callId: incomingCall.callId,
          channelName: incomingCall.channelName,
          callType: incomingCall.callType
        }
      })
      return true
    } catch (err) {
      console.error('Failed to send call response:', err)
      return false
    }
  }, [socket, isConnected, incomingCall])

  // Navigate to call page
  const navigateToCall = useCallback(async (channelName, callType, isAnswer = false) => {
    if (!currentUser?._id) return

    try {
      // Generate token for RTC
      const tokenResponse = await axios.post(`${BASE_URL}/generate-token`, {
        channelName: channelName,
        uid: currentUser._id.toString()
      })

      const chat = incomingCallChatRef.current
      const otherParticipant = callerInfo || chat?.participants?.find(p => {
        const participantId = p._id?.toString() || p?.toString()
        const callerId = incomingCall?.from?.toString()
        return participantId === callerId
      })

      const callData = {
        channelName: channelName,
        uid: currentUser._id.toString(),
        token: tokenResponse.data.token,
        callType: callType,
        otherParticipant: otherParticipant,
        chatId: chat?._id
      }

      navigate('/call', { state: callData })
    } catch (error) {
      console.error('Error navigating to call:', error)
      alert('Failed to start call. Please try again.')
    }
  }, [currentUser?._id, callerInfo, navigate, incomingCall])

  // Handle answering call
  const handleAnswerCall = useCallback(async () => {
    if (!incomingCall) return

    // Stop ringtone immediately
    stopRingtone()

    try {
      const chat = incomingCallChatRef.current

      // Create call message in chat when answering (if chat exists)
      if (chat?._id && currentUser?._id) {
        try {
          const callText = incomingCall.callType === 'video' ? 'Video call' : 'Audio call'
          await axios.post(`${BASE_URL}/api/chat/message`, {
            chatId: chat._id,
            sender: currentUser._id,
            content: `${callText} received`,
            messageType: incomingCall.callType === 'video' ? 'videoCall' : 'audioCall'
          })
        } catch (error) {
          console.error('Error creating call message:', error)
          // Don't block call if message creation fails
        }
      }

      // Send call response
      sendCallResponse('call_answer')

      // Navigate to call page
      await navigateToCall(incomingCall.channelName, incomingCall.callType, true)

      // Clear call state
      clearCallState()
    } catch (error) {
      console.error('Error answering call:', error)
      alert('Failed to answer call. Please try again.')
    }
  }, [incomingCall, currentUser?._id, sendCallResponse, navigateToCall, stopRingtone])

  // Handle rejecting call
  const handleRejectCall = useCallback(() => {
    if (!incomingCall) return

    // Stop ringtone immediately
    stopRingtone()

    try {
      sendCallResponse('call_reject')
    } catch (error) {
      console.error('Error rejecting call:', error)
    } finally {
      clearCallState()
    }
  }, [incomingCall, sendCallResponse, stopRingtone])

  // Auto-dismiss call after 30 seconds if not answered
  useEffect(() => {
    if (!incomingCall) {
      // Stop ringtone if call state is cleared
      stopRingtone()
      return
    }

    const timer = setTimeout(() => {
      console.log('Call auto-dismissed after 30 seconds')
      handleRejectCall()
    }, 30000)

    return () => clearTimeout(timer)
  }, [incomingCall, handleRejectCall, stopRingtone])

  // Don't render if no incoming call
  if (!incomingCall) return null

  const callTypeLabel = incomingCall.callType === 'video' ? 'Video Call' : 'Audio Call'
  const callerName = callerInfo?.username || callerInfo?.email || 'Unknown User'
  const callerAvatar = callerInfo?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-[400px] border-2 border-primary animate-pulse">
        {/* Call Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={callerAvatar}
              alt={callerName}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-ping"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">{callerName}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              {incomingCall.callType === 'video' ? '📹' : '📞'} {callTypeLabel}
            </p>
          </div>
        </div>

        {/* Call Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleRejectCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-semibold"
          >
            <FiPhoneOff className="w-5 h-5" />
            Decline
          </button>
          <button
            onClick={handleAnswerCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-semibold"
          >
            <FiPhoneCall className="w-5 h-5" />
            Answer
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlobalCallContainer
