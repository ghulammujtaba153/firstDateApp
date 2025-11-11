import React, { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from '../../components/dashboard/chats/Sidebar'
import ChatContainer from '../../components/dashboard/chats/ChatContainer'
import { useAuth } from '../../context/authContext'
import { useSocket } from '../../context/socketContext'
import { BASE_URL } from '../../config/url'
import axios from 'axios'
import Loader from '../../components/common/Loader'

const Chats = () => {
  const location = useLocation()
  const { user: currentUser } = useAuth()
  const { onlineUsers } = useSocket()
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser?._id) return

      try {
        setLoading(true)
        const response = await axios.get(`${BASE_URL}/api/chat/user/${currentUser._id}`)
        setChats(response.data || [])

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
  }, [currentUser?._id, location.state])

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

    // Determine if there's an unread message (message not sent by current user)
    const lastMessage = chat.lastMessage
    const hasUnread = lastMessage && 
      (lastMessage.sender?._id?.toString() !== currentUser?._id?.toString() && 
       lastMessage.sender?.toString() !== currentUser?._id?.toString())

    // Format last message text
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

  if (loading) {
    return <Loader />
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-1rem)] md:h-[calc(100vh-2rem)] m-2 md:m-4 shadow-lg rounded-[20px] md:rounded-[30px] overflow-hidden bg-white">
      <Sidebar 
        users={sortedUsers} 
        selectedUser={selectedChat}
        onUserSelect={handleUserSelect}
      />
      <ChatContainer 
        selectedChat={selectedChat}
        currentUserId={currentUser?._id}
        onMessageSent={updateChatLastMessage}
      />
    </div>
  )
}

export default Chats
