import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { BASE_URL } from '../config/url'
import { useAuth } from './authContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    if (!user?._id) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setIsConnected(false)
        setOnlineUsers(new Set())
      }
      return
    }

    // Clean up existing connection before creating new one
    if (socketRef.current) {
      console.log('Cleaning up existing socket connection')
      socketRef.current.removeAllListeners()
      socketRef.current.disconnect()
      socketRef.current = null
    }

    // Initialize socket connection
    const socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      forceNew: false, // Reuse connection if possible
      autoConnect: true
    })

    socketRef.current = socket

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      setIsConnected(true)

      // Send user connection info
      socket.emit('user:connect', { userId: user._id.toString() })
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    // User presence events
    socket.on('user:online', ({ userId }) => {
      setOnlineUsers(prev => new Set([...prev, userId]))
    })

    socket.on('user:offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    })

    // Receive initial list of online users when connecting
    socket.on('users:online', ({ users }) => {
      if (Array.isArray(users)) {
        setOnlineUsers(new Set(users))
      }
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [user?._id])

  const value = {
    socket: socketRef.current,
    isConnected,
    onlineUsers
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

