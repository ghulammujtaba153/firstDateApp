import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/dashboard/chats/Sidebar'
import ChatContainer from '../../components/dashboard/chats/ChatContainer'
import { useAuth } from '../../context/authContext'
import { useSocket } from '../../context/socketContext'
import { BASE_URL } from '../../config/url'
import axios from 'axios'
import Loader from '../../components/common/Loader'

const Chats = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const { onlineUsers, socket, isConnected } = useSocket()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [globalIncomingCall, setGlobalIncomingCall] = useState(null)
  const incomingCallChatRef = useRef(null)

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser?._id) return

      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/chat/user/${currentUser._id}`)
        setChats(response.data || [])

        // Join all chat rooms for real-time message delivery
        if (socket && isConnected && response.data) {
          response.data.forEach(chat => {
            if (chat._id) {
              socket.emit('chat:join', { chatId: chat._id })
              console.log(`Joined chat room for real-time updates: ${chat._id}`)
            }
          })
        }

        // If navigating from MatchDetail with a chatId, select that chat
        if (location.state?.chatId) {
          const chat = response.data.find(c => c._id === location.state.chatId)
          if (chat) {
            setSelectedChat(chat)
          }
        } else if (location.state?.userId) {
          // If navigating with userId, find or create chat
          const chat = response.data.find(c => 
            c.participants.some(p => p._id === location.state.userId)
          )
          if (chat) {
            setSelectedChat(chat)
          }
        }
      } catch (error) {
        console.error('Error fetching chats:', error)
        setChats([])
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [currentUser?._id, location.state, socket, isConnected])

  // Online status is now handled by Socket.io context
  // No need for separate presence tracking - Socket.io handles it automatically

  // Update chat's last message locally without refetching
  const updateChatLastMessage = useCallback((chatId, message) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage: message
          }
        }
        return chat
      })
    })
    // Update selectedChat if it's the current chat (using functional update to avoid dependency)
    setSelectedChat(prevSelected => {
      if (prevSelected?._id === chatId) {
        return {
          ...prevSelected,
          lastMessage: message
        }
      }
      return prevSelected
    })
  }, [])

  // Update unread count when messages are marked as read
  const updateUnreadCount = useCallback((chatId) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat._id === chatId) {
          return {
            ...chat,
            unreadCount: 0
          }
        }
        return chat
      })
    })
    // Update selectedChat if it's the current chat
    setSelectedChat(prevSelected => {
      if (prevSelected?._id === chatId) {
        return {
          ...prevSelected,
          unreadCount: 0
        }
      }
      return prevSelected
    })
  }, [])

  // Transform chats data for Sidebar
  const users = chats.map(chat => {
    // Get the other participant (not current user)
    const otherParticipant = chat.participants?.find(
      p => {
        const participantId = p._id?.toString() || p.toString()
        const currentId = currentUser?._id?.toString()
        return participantId !== currentId
      }
    ) || chat.participants?.[0]

    // Get unread count from chat object (set by backend)
    const unreadCount = chat.unreadCount || 0
    const hasUnread = unreadCount > 0

    // Format last message text
    const lastMessage = chat.lastMessage
    let lastMessageText = "No messages yet"
    if (lastMessage) {
      if (lastMessage.messageType === 'image') {
        lastMessageText = '📷 Image'
      } else if (lastMessage.messageType === 'file') {
        lastMessageText = '📎 File'
      } else if (lastMessage.messageType === 'video') {
        lastMessageText = '🎥 Video'
      } else if (lastMessage.messageType === 'audio') {
        lastMessageText = '🎤 Voice note'
      } else {
        lastMessageText = lastMessage.content || 'No messages yet'
      }
    }

    // Check if the other participant is online
    // Normalize IDs to strings for consistent comparison
    const otherParticipantId = otherParticipant?._id?.toString()
    const isOnline = otherParticipantId ? onlineUsers.has(otherParticipantId) : false

    return {
      id: chat._id,
      chatId: chat._id,
      chat: chat, // Store the full chat object
      userId: otherParticipant?._id,
      name: otherParticipant?.username || 'Unknown User',
      avatar: otherParticipant?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
      online: isOnline,
      lastMessage: lastMessageText,
      hasUnread: hasUnread,
      unreadCount: unreadCount,
      lastMessageTime: lastMessage?.timestamp || chat.createdAt,
    }
  })

  // Sort users: unread messages first, then by last message time
  const sortedUsers = [...users].sort((a, b) => {
    // Unread messages first
    if (a.hasUnread && !b.hasUnread) return -1
    if (!a.hasUnread && b.hasUnread) return 1
    // Then by last message time
    const aTime = new Date(a.lastMessageTime || 0)
    const bTime = new Date(b.lastMessageTime || 0)
    return bTime - aTime
  })

  const handleUserSelect = (user) => {
    // Find the actual chat object from the chats array
    const chat = chats.find(c => c._id === user.chatId || c._id === user.id)
    if (chat) {
      setSelectedChat(chat)
    }
  }

  // Listen for new messages globally to update chat list
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleGlobalNewMessage = (data) => {
      const { chatId, message } = data
      
      if (!chatId || !message) return

      // Update the chat's last message in the list
      updateChatLastMessage(chatId, message)
      
      // Refresh unread count if message is not from current user
      const messageSenderId = message.sender?._id?.toString() || message.sender?.toString()
      const currentUserIdStr = currentUser?._id?.toString()
      if (messageSenderId !== currentUserIdStr) {
        // Increment unread count for this chat
        setChats(prevChats => {
          return prevChats.map(chat => {
            if (chat._id === chatId) {
              return {
                ...chat,
                unreadCount: (chat.unreadCount || 0) + 1
              }
            }
            return chat
          })
        })
      }
    }

    socket.on('message:new', handleGlobalNewMessage)

    return () => {
      socket.off('message:new', handleGlobalNewMessage)
    }
  }, [socket, isConnected, currentUser?._id, updateChatLastMessage])

  // Global call invitation handler - works even when no chat is selected
  useEffect(() => {
    if (!socket || !isConnected || !currentUser?._id) return

    const handleGlobalCallInvite = async (data) => {
      const { from, callType, channelName, callId } = data
      
      // Find the chat with the caller
      const callerId = from?.toString()
      const chatWithCaller = chats.find(chat => 
        chat.participants?.some(p => {
          const participantId = p._id?.toString() || p?.toString()
          return participantId === callerId
        })
      )

      if (chatWithCaller) {
        // Store the chat for the call
        incomingCallChatRef.current = chatWithCaller
        // Select the chat so the call UI can show
        setSelectedChat(chatWithCaller)
        // Set global incoming call state
        setGlobalIncomingCall({
          from,
          callType,
          channelName,
          callId
        })
      } else {
        // If no chat found, still show notification but we need to create/find chat
        console.warn('Call from user without existing chat:', callerId)
        setGlobalIncomingCall({
          from,
          callType,
          channelName,
          callId
        })
      }
    }

    socket.on('call:invite', handleGlobalCallInvite)

    return () => {
      socket.off('call:invite', handleGlobalCallInvite)
    }
  }, [socket, isConnected, currentUser?._id, chats])

  // Handle answering global incoming call
  const handleAnswerGlobalCall = useCallback(async () => {
    if (!globalIncomingCall) return

    try {
      const chat = incomingCallChatRef.current || selectedChat
      if (!chat) {
        console.error('No chat found for call')
        return
      }

      // Get the other participant
      const otherParticipant = chat.participants?.find(p => {
        const participantId = p._id?.toString() || p?.toString()
        const callerId = globalIncomingCall.from?.toString()
        return participantId === callerId
      })

      if (!otherParticipant) {
        console.error('Other participant not found')
        return
      }

      // Create call message in chat when answering
      try {
        const callText = globalIncomingCall.callType === 'video' ? 'Video call' : 'Audio call'
        await axios.post(`${BASE_URL}/api/chat/message`, {
          chatId: chat._id,
          sender: currentUser._id,
          content: `${callText} received`,
          messageType: globalIncomingCall.callType === 'video' ? 'videoCall' : 'audioCall'
        })
        // Refresh chats to update last message
        const response = await axios.get(`${BASE_URL}/api/chat/user/${currentUser._id}`)
        setChats(response.data || [])
      } catch (error) {
        console.error('Error creating call message:', error)
        // Don't block call if message creation fails
      }

      // Generate token for RTC
      const tokenResponse = await axios.post(`${BASE_URL}/generate-token`, {
        channelName: globalIncomingCall.channelName,
        uid: currentUser._id.toString()
      })

      const callData = {
        channelName: globalIncomingCall.channelName,
        uid: currentUser._id.toString(),
        token: tokenResponse.data.token,
        callType: globalIncomingCall.callType,
        otherParticipant: otherParticipant,
        chatId: chat._id
      }

      // Send call response
      if (socket && isConnected) {
        socket.emit('call:response', {
          toUserId: globalIncomingCall.from?.toString(),
          responseType: 'call_answer',
          callData: {
            callId: globalIncomingCall.callId,
            channelName: globalIncomingCall.channelName,
            callType: globalIncomingCall.callType
          }
        })
      }

      // Navigate to call page
      navigate('/call', { state: callData })
      setGlobalIncomingCall(null)
      incomingCallChatRef.current = null
    } catch (error) {
      console.error('Error answering call:', error)
      alert('Failed to answer call. Please try again.')
    }
  }, [globalIncomingCall, selectedChat, currentUser, socket, isConnected, navigate])

  // Handle rejecting global incoming call
  const handleRejectGlobalCall = useCallback(() => {
    if (!globalIncomingCall || !socket || !isConnected) {
      setGlobalIncomingCall(null)
      incomingCallChatRef.current = null
      return
    }

    try {
      socket.emit('call:response', {
        toUserId: globalIncomingCall.from?.toString(),
        responseType: 'call_reject',
        callData: {
          callId: globalIncomingCall.callId,
          channelName: globalIncomingCall.channelName,
          callType: globalIncomingCall.callType
        }
      })
    } catch (error) {
      console.error('Error rejecting call:', error)
    } finally {
      setGlobalIncomingCall(null)
      incomingCallChatRef.current = null
    }
  }, [globalIncomingCall, socket, isConnected])

  if (loading) {
    return <Loader />
  }

  // Get caller info for global call notification
  const getCallerInfo = () => {
    if (!globalIncomingCall) return null
    
    const callerId = globalIncomingCall.from?.toString()
    const chat = incomingCallChatRef.current || chats.find(chat => 
      chat.participants?.some(p => {
        const participantId = p._id?.toString() || p?.toString()
        return participantId === callerId
      })
    )
    
    if (chat) {
      const caller = chat.participants?.find(p => {
        const participantId = p._id?.toString() || p?.toString()
        return participantId === callerId
      })
      return caller
    }
    return null
  }

  const callerInfo = getCallerInfo()

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] m-2 md:m-4 shadow-lg rounded-[20px] md:rounded-[30px] overflow-hidden bg-white relative">
      {/* Global Call Notification - shows even when no chat is selected */}
      {globalIncomingCall && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <img
                src={callerInfo?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"}
                alt={callerInfo?.username || "User"}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {globalIncomingCall.callType === 'video' ? '📹 Video' : '📞 Audio'} Call
              </h3>
              <p className="text-lg text-gray-600">
                {callerInfo?.username || 'Unknown User'} is calling...
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRejectGlobalCall}
                className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">📞</span>
                Decline
              </button>
              <button
                onClick={handleAnswerGlobalCall}
                className="px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <span className="text-xl">📞</span>
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        users={sortedUsers} 
        selectedUser={selectedChat}
        onUserSelect={handleUserSelect}
      />
      <ChatContainer 
        selectedChat={selectedChat}
        currentUserId={currentUser?._id}
        onMessageSent={updateChatLastMessage}
        onMessagesRead={updateUnreadCount}
        globalIncomingCall={globalIncomingCall}
        onGlobalCallAnswered={handleAnswerGlobalCall}
        onGlobalCallRejected={handleRejectGlobalCall}
      />
    </div>
  )
}

export default Chats
