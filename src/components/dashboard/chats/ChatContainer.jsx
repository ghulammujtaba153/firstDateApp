import React, { useRef, useState, useEffect, useMemo } from 'react'
import { FiPhone } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { BASE_URL } from '../../../config/url'
import axios from 'axios'
import { useAuth } from '../../../context/authContext'
import { useSocket } from '../../../context/socketContext'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

const ChatContainer = ({ selectedChat, currentUserId, onMessageSent, globalIncomingCall, onGlobalCallAnswered, onGlobalCallRejected }) => {
  const { user: currentUser } = useAuth()
  const { socket, isConnected } = useSocket()
  const navigate = useNavigate()
  const [recording, setRecording] = useState(false)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [deletingMessageId, setDeletingMessageId] = useState(null)
  const [hoveredMessageId, setHoveredMessageId] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callState, setCallState] = useState(null) // 'calling', 'ringing', 'answered'
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const messagesEndRef = useRef(null)

  // Get the other participant
  const otherParticipant = useMemo(() => {
    if (!selectedChat?.participants || !currentUserId) return null

    const currentId = currentUserId?.toString() || currentUser?._id?.toString()
    const found = selectedChat.participants.find(p => {
      const participantId = p._id?.toString() || p?.toString()
      return participantId && participantId !== currentId
    })

    return found || selectedChat.participants[0]
  }, [selectedChat, currentUserId, currentUser?._id])

  // Generate consistent channel name from two users' usernames (sorted for consistency)
  const getChannelName = useMemo(() => {
    if (!selectedChat?.participants || !currentUser) {
      console.warn("Cannot generate channel name: missing participants or currentUser")
      return null
    }
    
    // Get both users (current user and other participant)
    const currentId = currentUserId?.toString() || currentUser?._id?.toString()
    
    // Helper function to extract username from participant
    const extractUsername = (participant) => {
      if (!participant) return null
      
      // Try username first
      if (participant.username && typeof participant.username === 'string' && participant.username.trim()) {
        return participant.username.trim()
      }
      
      // Try email (extract part before @)
      if (participant.email && typeof participant.email === 'string') {
        const emailParts = participant.email.split('@')
        if (emailParts[0] && emailParts[0].trim()) {
          return emailParts[0].trim()
        }
      }
      
      // Fallback to ID (last 8 characters for readability)
      if (participant._id) {
        const idStr = participant._id.toString()
        return idStr.slice(-8)
      }
      
      return null
    }
    
    // Get usernames for both participants
    const currentUserParticipant = selectedChat.participants.find(p => {
      const participantId = p._id?.toString() || p?.toString()
      return participantId === currentId
    }) || currentUser
    
    const otherUserParticipant = selectedChat.participants.find(p => {
      const participantId = p._id?.toString() || p?.toString()
      return participantId !== currentId
    })
    
    if (!otherUserParticipant) {
      console.warn("Cannot find other participant for channel name generation")
      console.debug("Participants:", selectedChat.participants, "Current ID:", currentId)
      return null
    }
    
    // Extract usernames
    const currentUsername = extractUsername(currentUserParticipant)
    const otherUsername = extractUsername(otherUserParticipant)
    
    if (!currentUsername || !otherUsername) {
      console.warn("Cannot extract usernames for channel generation", {
        currentUserParticipant,
        otherUserParticipant,
        currentUsername,
        otherUsername
      })
      return null
    }
    
    // Sort usernames alphabetically to ensure both users generate the same channel name
    const usernames = [currentUsername, otherUsername]
      .map(u => u.toLowerCase().trim())
      .filter(u => u.length > 0)
      .sort()
    
    if (usernames.length !== 2) {
      console.warn("Invalid usernames for channel generation:", { currentUsername, otherUsername, usernames })
      return null
    }
    
    // Generate channel name: chat_user1_user2 (sorted, sanitized)
    const channelName = `chat_${usernames[0]}_${usernames[1]}`.replace(/[^a-z0-9_]/g, '_')
    console.log("Generated channel name:", channelName, "from users:", usernames, "participants:", selectedChat.participants.map(p => ({ id: p._id, username: p.username, email: p.email })))
    return channelName
  }, [selectedChat?.participants, currentUser, currentUserId])

  // Fetch messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat?._id) return

      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/chat/${selectedChat._id}/messages`)
        setMessages(response.data || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [selectedChat?._id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getFileType = (file) => {
    const type = file.type || ''
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.startsWith('audio/')) return 'audio'
    return 'file'
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show file preview
    setSelectedFile(file)

    // Create preview for images only
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const removeSelectedFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendFile = async () => {
    if (!selectedFile || !selectedChat?._id || !currentUser?._id || uploadingFile) return

    try {
      setUploadingFile(true)
      setUploadProgress(0)

      // Upload file using multer API
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadResponse = await axios.post(`${BASE_URL}/api/upload/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        }
      })

      if (!uploadResponse.data?.url) {
        throw new Error('Failed to upload file')
      }

      // Determine message type
      const messageType = getFileType(selectedFile)

      // Send file message
      const response = await axios.post(`${BASE_URL}/api/chat/message`, {
        chatId: selectedChat._id,
        sender: currentUser._id,
        content: uploadResponse.data.url,
        messageType: messageType
      })

      // Add new message to local state
      setMessages(prev => [...prev, response.data])

      // Clear file selection
      removeSelectedFile()

      // Update parent's chat list last message (no refresh needed)
      if (onMessageSent && selectedChat?._id) {
        onMessageSent(selectedChat._id, response.data)
      }

      // Socket notification handled automatically by backend
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(error.response?.data?.error || 'Failed to upload file. Please try again.')
    } finally {
      setUploadingFile(false)
      setUploadProgress(0)
    }
  }

  // Note: Socket.io notifications are handled automatically by the backend
  // when messages are saved via HTTP API - no need for client-side emit

  // Send call invitation via Socket.io
  const sendCallInvitation = React.useCallback((callType, channelName, callId) => {
    if (!socket || !isConnected) {
      console.info("Socket not connected - call will proceed without invitation")
      return true
    }

    try {
      const otherUserId = otherParticipant?._id?.toString()
      if (!otherUserId) {
        return true
      }

      socket.emit('call:invite', {
        toUserId: otherUserId,
        callData: {
          callType,
          channelName,
          callId
        }
      })
      console.log("✓ Call invitation sent via Socket.io")
            return true
    } catch (err) {
      console.info("Socket invitation error (non-critical):", err.message || err)
            return true
          }
  }, [socket, isConnected, otherParticipant?._id])

  // Send call response via Socket.io
  const sendCallResponse = React.useCallback((responseType, callId, channelName, callType) => {
    if (!socket || !isConnected) {
      return false
    }

    try {
      const otherUserId = otherParticipant?._id?.toString()
      if (!otherUserId) {
        return false
      }

      socket.emit('call:response', {
        toUserId: otherUserId,
        responseType,
        callData: {
          callId,
          channelName,
          callType
        }
      })
        return true
    } catch (err) {
      console.error("Failed to send call response:", err)
      return false
    }
  }, [socket, isConnected, otherParticipant?._id])

  // Navigate to call page (defined first to avoid hoisting issues)
  const navigateToCall = React.useCallback(async (channelName, callType, isAnswer = false) => {
    try {
      // Generate token for RTC
      const tokenResponse = await axios.post(`${BASE_URL}/generate-token`, {
        channelName: channelName,
        uid: currentUser._id.toString()
      })

      const callData = {
        channelName: channelName,
        uid: currentUser._id.toString(),
        token: tokenResponse.data.token,
        callType: callType, // 'audio' or 'video'
        otherParticipant: otherParticipant,
        chatId: selectedChat?._id
      }

      navigate('/call', { state: callData })
    } catch (error) {
      console.error('Error initiating call:', error)
      alert('Failed to start call. Please try again.')
    }
  }, [currentUser._id, otherParticipant, selectedChat?._id, navigate])

  // Initiate call (audio or video)
  const initiateCall = React.useCallback(async (callType) => {
    if (!selectedChat?._id || !otherParticipant?._id) {
      alert('Unable to start call. Please select a chat first.')
      return
    }

    // Check if Agora is configured
    const appId = import.meta.env.VITE_AGORA_APP_ID
    if (!appId) {
      alert('Agora is not configured. Please set VITE_AGORA_APP_ID in your .env file.')
      return
    }

    try {
      setCallState('calling')
      // Use same channel naming pattern as chat (user1_user2) for calls
      const callChannelName = getChannelName ? `call_${getChannelName.replace('chat_', '')}` : `call_${selectedChat._id}_${Date.now()}`
      const callId = `${currentUser._id}_${Date.now()}`
      
      // Try to send call invitation via Socket.io in background (non-blocking)
      // Socket.io is optional - RTC calls work independently
      // Socket.io is only used for call notifications, not for the actual call
      if (sendCallInvitation) {
        sendCallInvitation(callType, callChannelName, callId)
      }
      
      // Navigate to call page immediately
      // Agora RTC works independently - doesn't require Socket.io
      navigateToCall(callChannelName, callType, false)
    } catch (error) {
      console.error('Error initiating call:', error)
      setCallState(null)
      // Only show error for critical failures
      if (error.message && error.message.includes('Agora')) {
        alert(error.message)
      } else {
        alert('Failed to start call. Please check your connection and try again.')
      }
    }
  }, [selectedChat?._id, otherParticipant?._id, currentUser._id, getChannelName, navigateToCall, sendCallInvitation])

  // Answer incoming call
  const answerCall = React.useCallback(async () => {
    if (!incomingCall) return

    try {
      await sendCallResponse('call_answer', incomingCall.callId, incomingCall.channelName, incomingCall.callType)
      setIncomingCall(null)
      setCallState(null)
      navigateToCall(incomingCall.channelName, incomingCall.callType, true)
    } catch (error) {
      console.error('Error answering call:', error)
      alert('Failed to answer call. Please try again.')
    }
  }, [incomingCall, sendCallResponse, navigateToCall])

  // Reject incoming call
  const rejectCall = React.useCallback(async () => {
    if (!incomingCall) return

    try {
      await sendCallResponse('call_reject', incomingCall.callId, incomingCall.channelName, incomingCall.callType)
      setIncomingCall(null)
      setCallState(null)
    } catch (error) {
      console.error('Error rejecting call:', error)
    }
  }, [incomingCall, sendCallResponse])

  // Handle incoming Socket.io messages and events
  useEffect(() => {
    if (!socket || !isConnected) return

    // Handle new messages
    const handleNewMessage = (data) => {
      const { chatId, message } = data
      
      // Only add if it's for the currently selected chat and not already present
      if (chatId === selectedChat?._id) {
          setMessages(prev => {
          if (prev.some(m => m._id === message._id)) return prev
          return [...prev, message]
          })
        }
        
        // Update parent's chat list last message for incoming messages
      if (onMessageSent && chatId) {
        onMessageSent(chatId, message)
      }
    }

    // Handle call invitation (only if chat is selected and matches the caller)
    // Global call handling is done in Chats component
    const handleCallInvite = (data) => {
      const { from, callType, channelName, callId } = data
      
      // Only handle if this is for the currently selected chat
      if (selectedChat) {
        const callerId = from?.toString()
        const isCallerInChat = selectedChat.participants?.some(p => {
          const participantId = p._id?.toString() || p?.toString()
          return participantId === callerId
        })
        
        if (isCallerInChat) {
          setIncomingCall({
            from,
            callType,
            channelName,
            callId
          })
          setCallState('ringing')
        }
      }
    }

    // Handle call response
    const handleCallResponse = (data) => {
      const { from, responseType, channelName, callType } = data
      
      if (responseType === 'call_answer') {
        setCallState('answered')
        navigateToCall(channelName, callType, true)
      } else if (responseType === 'call_reject' || responseType === 'call_end') {
        setIncomingCall(null)
        setCallState(null)
      }
    }

    socket.on('message:new', handleNewMessage)
    socket.on('call:invite', handleCallInvite)
    socket.on('call:response', handleCallResponse)

    return () => {
      socket.off('message:new', handleNewMessage)
      socket.off('call:invite', handleCallInvite)
      socket.off('call:response', handleCallResponse)
    }
  }, [socket, isConnected, selectedChat?._id, onMessageSent, navigateToCall])

  // Join/leave chat room when chat is selected
  useEffect(() => {
    if (!socket || !isConnected || !selectedChat?._id) return

    // Join the chat room
    socket.emit('chat:join', { chatId: selectedChat._id })
    console.log(`Joined chat room: ${selectedChat._id}`)

    // Cleanup: leave chat room when chat changes or component unmounts
    return () => {
      if (socket && isConnected) {
        socket.emit('chat:leave', { chatId: selectedChat._id })
        console.log(`Left chat room: ${selectedChat._id}`)
      }
    }
  }, [socket, isConnected, selectedChat?._id])

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || deletingMessageId) return

    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      setDeletingMessageId(messageId)
      await axios.delete(`${BASE_URL}/api/chat/message/${messageId}`)

      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg._id !== messageId))

      // Note: No need to update parent on delete since last message won't change
      // (we delete from the middle, not the last message)
    } catch (error) {
      console.error('Error deleting message:', error)
      alert(error.response?.data?.error || 'Failed to delete message. Please try again.')
    } finally {
      setDeletingMessageId(null)
    }
  }

  // handle audio recording (unchanged)
  const handleMicClick = async () => {
    if (recording) {
      // Stop recording and send voice note
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        setRecording(false)
      }
    } else {
      // Start recording
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaRecorderRef.current = new window.MediaRecorder(stream, {
            mimeType: 'audio/webm;codecs=opus'
          })
          audioChunksRef.current = []

          mediaRecorderRef.current.ondataavailable = event => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data)
            }
          }

          mediaRecorderRef.current.onstop = async () => {
            try {
              // Create audio blob
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })

              // Create a File object from the blob
              const audioFile = new File([audioBlob], `voice-note-${Date.now()}.webm`, {
                type: 'audio/webm'
              })

              // Upload the voice note
              setUploadingFile(true)
              setUploadProgress(0)

              const formData = new FormData()
              formData.append('file', audioFile)

              const uploadResponse = await axios.post(`${BASE_URL}/api/upload/file`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                  setUploadProgress(percentCompleted)
                }
              })

              if (!uploadResponse.data?.url) {
                throw new Error('Failed to upload voice note')
              }

              // Send voice note message
              const response = await axios.post(`${BASE_URL}/api/chat/message`, {
                chatId: selectedChat._id,
                sender: currentUser._id,
                content: uploadResponse.data.url,
                messageType: 'audio'
              })

              // Add new message to local state
              setMessages(prev => [...prev, response.data])

              // Update parent's chat list last message (no refresh needed)
              if (onMessageSent && selectedChat?._id) {
                onMessageSent(selectedChat._id, response.data)
              }

              // Socket.io notification handled automatically by backend

              // Clean up
              audioChunksRef.current = []
              setUploadingFile(false)
              setUploadProgress(0)
            } catch (error) {
              console.error('Error sending voice note:', error)
              alert(error.response?.data?.error || 'Failed to send voice note. Please try again.')
              setUploadingFile(false)
              setUploadProgress(0)
            }
          }

          mediaRecorderRef.current.start()
          setRecording(true)
        } else {
          alert('Your browser does not support audio recording.')
        }
      } catch (error) {
        console.error('Error accessing microphone:', error)
        alert('Failed to access microphone. Please check your permissions.')
      }
    }
  }

  // --- NEW: implement handleSendMessage safely ---
  const handleSendMessage = async (e) => {
    e.preventDefault()
    const text = (messageInput || '').trim()
    console.log("sending message")
    console.log(text, selectedChat?._id, currentUser?._id, sending)
    if (!text || !selectedChat?._id || !currentUser?._id || sending) return

    try {
      setSending(true)
      const response = await axios.post(`${BASE_URL}/api/chat/message`, {
        chatId: selectedChat._id,
        sender: currentUser._id,
        content: text,
        messageType: 'text'
      })

      // Append message locally
      setMessages(prev => [...prev, response.data])
      setMessageInput('')

      // Update parent's chat list last message (no refresh needed)
      if (onMessageSent && selectedChat?._id) {
        onMessageSent(selectedChat._id, response.data)
      }

      // Socket notification handled automatically by backend
    } catch (error) {
      console.error('Error sending message:', error)
      alert(error.response?.data?.error || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Empty state when no chat is selected
  if (!selectedChat) {
    return (
      <div className="flex flex-col h-screen bg-white flex-1 items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPhone size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a chat</h3>
          <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white p-3 md:p-6 flex-1 min-w-0 relative">
      <ChatHeader
        otherParticipant={otherParticipant}
        callState={callState}
        onInitiateCall={initiateCall}
        incomingCall={globalIncomingCall || incomingCall}
        onAnswerCall={onGlobalCallAnswered || answerCall}
        onRejectCall={onGlobalCallRejected || rejectCall}
      />

      <MessageList
        messages={messages}
        loading={loading}
        currentUserId={currentUserId}
        currentUser={currentUser}
        onDeleteMessage={handleDeleteMessage}
        deletingMessageId={deletingMessageId}
        hoveredMessageId={hoveredMessageId}
        setHoveredMessageId={setHoveredMessageId}
        messagesEndRef={messagesEndRef}
      />

      <MessageInput
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        sending={sending}
        uploadingFile={uploadingFile}
        selectedFile={selectedFile}
        filePreview={filePreview}
        uploadProgress={uploadProgress}
        recording={recording}
        fileInputRef={fileInputRef}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeSelectedFile}
        onSendFile={handleSendFile}
        onSendMessage={handleSendMessage}
        onMicClick={handleMicClick}
      />
    </div>
  )
}

export default ChatContainer
