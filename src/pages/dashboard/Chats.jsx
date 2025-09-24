import React from 'react'
import Sidebar from '../../components/dashboard/chats/Sidebar'
import ChatContainer from '../../components/dashboard/chats/ChatContainer'

// Dummy users data
const users = [
  {
    id: 1,
    name: "User 1",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    online: true,
    lastMessage: "Hey there!",
  },
  {
    id: 2,
    name: "User 2",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    online: true,
    lastMessage: "last message...",
  },
  {
    id: 3,
    name: "User 3",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    online: false,
    lastMessage: "See you soon!",
  },
]

// Dummy grouped messages data
const groupedMessages = [
  {
    date: '1/1/25',
    messages: [
      { id: 1, text: "Hello!", sent: false },
      { id: 2, text: "Hi, how are you?", sent: true },
    ]
  },
  {
    date: '2/1/25',
    messages: [
      { id: 3, text: "I'm good, thanks!", sent: false },
      { id: 4, text: "Great to hear!", sent: true },
    ]
  }
]

const Chats = () => {
  return (
    <div className="flex h-screen m-4 shadow-lg rounded-[30px] overflow-hidden bg-white">
      <Sidebar users={users} />
      <ChatContainer groupedMessages={groupedMessages} />
    </div>
  )
}

export default Chats
