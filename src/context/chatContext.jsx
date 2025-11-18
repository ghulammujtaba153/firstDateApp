import React, { createContext, useContext, useState, useCallback } from 'react'

const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [chatStatuses, setChatStatuses] = useState({}) // { chatId: 'active' | 'inactive' }

  const updateChatStatus = useCallback((chatId, status) => {
    setChatStatuses(prev => ({
      ...prev,
      [chatId]: status
    }))
  }, [])

  const getChatStatus = useCallback((chatId) => {
    return chatStatuses[chatId] || 'active'
  }, [chatStatuses])

  return (
    <ChatContext.Provider value={{ chatStatuses, updateChatStatus, getChatStatus }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}