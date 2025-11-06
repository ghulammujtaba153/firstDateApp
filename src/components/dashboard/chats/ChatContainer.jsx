import React, { useRef, useState, useEffect, useMemo } from 'react'
import { FiSend, FiPaperclip, FiMic, FiArrowLeft, FiVideo, FiPhone, FiFile, FiX, FiImage, FiDownload, FiTrash2 } from 'react-icons/fi'
import { BASE_URL } from '../../../config/url'
import axios from 'axios'
import { useAuth } from '../../../context/authContext'

const ChatContainer = ({ selectedChat, currentUserId, onMessageSent }) => {
  const { user: currentUser } = useAuth()
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

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const grouped = {}
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      })
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(msg)
    })
    return Object.entries(grouped).map(([date, msgs]) => ({
      date,
      messages: msgs
    }))
  }

  const groupedMessages = groupMessagesByDate(messages)

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
      
      // Notify parent to refresh chat list
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(error.response?.data?.error || 'Failed to upload file. Please try again.')
    } finally {
      setUploadingFile(false)
      setUploadProgress(0)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedChat?._id || !currentUser?._id || sending) return

    try {
      setSending(true)
      const response = await axios.post(`${BASE_URL}/api/chat/message`, {
        chatId: selectedChat._id,
        sender: currentUser._id,
        content: messageInput.trim(),
        messageType: 'text'
      })

      // Add new message to local state
      setMessages(prev => [...prev, response.data])
      setMessageInput('')
      
      // Notify parent to refresh chat list
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

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
      
      // Notify parent to refresh chat list
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert(error.response?.data?.error || 'Failed to delete message. Please try again.')
    } finally {
      setDeletingMessageId(null)
    }
  }

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
              
              // Notify parent to refresh chat list
              if (onMessageSent) {
                onMessageSent()
              }

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
    <div className="flex flex-col h-full bg-white p-3 md:p-6 flex-1 min-w-0">
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
          <button className="p-2 rounded-full ">
            <FiPhone size={20} className="text-gray-500 hover:text-primary" />
          </button>
          <button className="p-2 rounded-full ">
            <FiVideo size={20} className="text-gray-500 hover:text-primary" />
          </button>
        </div>
      </div>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto mb-3 md:mb-4 flex flex-col gap-2 md:gap-3 slim-scrollbar px-1 md:px-2">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : groupedMessages.length > 0 ? (
          groupedMessages.map(group => (
            <React.Fragment key={group.date}>
              <div className="flex justify-center my-2">
                <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-lg text-xs font-medium">
                  {group.date}
                </span>
              </div>
              {group.messages.map(msg => {
                const senderId = msg.sender?._id?.toString() || msg.sender?.toString() || msg.sender
                const currentId = currentUserId?.toString() || currentUser?._id?.toString()
                const isSent = senderId === currentId
                
                // Render different message types
                const renderMessage = () => {
                  if (msg.messageType === 'image') {
                    const imageUrl = msg.content.startsWith('http') ? msg.content : `${BASE_URL}${msg.content}`
                    return (
                      <div className={`rounded-xl overflow-hidden max-w-[85%] md:max-w-md shadow-md ${isSent ? 'bg-primary/10' : 'bg-gray-50'}`}>
                        <img 
                          src={imageUrl} 
                          alt="Shared image" 
                          className="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(imageUrl, '_blank')}
                        />
                      </div>
                    )
                  }
                  
                  if (msg.messageType === 'video') {
                    const videoUrl = msg.content.startsWith('http') ? msg.content : `${BASE_URL}${msg.content}`
                    return (
                      <div className={`rounded-xl overflow-hidden max-w-[85%] md:max-w-md shadow-md ${isSent ? 'bg-primary/10' : 'bg-gray-50'}`}>
                        <video 
                          src={videoUrl} 
                          controls 
                          className="max-w-full h-auto"
                        />
                      </div>
                    )
                  }
                  
                  if (msg.messageType === 'audio') {
                    const audioUrl = msg.content.startsWith('http') ? msg.content : `${BASE_URL}${msg.content}`
                    return (
                      <div className={`px-3 md:px-4 py-2 md:py-3 rounded-xl max-w-[85%] md:max-w-md shadow-sm ${isSent ? 'bg-primary/10' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className={`p-2 rounded-full ${isSent ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                            <FiMic size={16} className="md:w-4 md:h-4" />
                          </div>
                          <audio 
                            controls 
                            src={audioUrl}
                            className="flex-1 h-8 md:h-10"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                    )
                  }
                  
                  if (msg.messageType === 'file') {
                    const fileName = msg.content.split('/').pop() || 'File'
                    const fileUrl = msg.content.startsWith('http') ? msg.content : `${BASE_URL}${msg.content}`
                    return (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-3 md:px-4 py-2 md:py-3 rounded-xl max-w-[85%] md:max-w-md break-words flex items-center gap-2 md:gap-3 shadow-sm transition-all text-sm md:text-base ${isSent ? 'bg-primary text-white hover:bg-primary/90' : 'bg-gray-50 text-gray-800 border hover:bg-gray-100'}`}
                      >
                        <FiFile size={18} className="flex-shrink-0 md:w-5 md:h-5" />
                        <span className="truncate flex-1">{fileName}</span>
                        <FiDownload size={14} className="flex-shrink-0 md:w-4 md:h-4" />
                      </a>
                    )
                  }
                  
                  // Text message
                  return (
                    <div className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl max-w-[85%] md:max-w-md break-words shadow-sm text-sm md:text-base ${isSent ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800 border'}`}>
                      {msg.content}
                    </div>
                  )
                }
                
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'} group relative`}
                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="relative flex items-center gap-2">
                      {/* Delete button - only show for sent messages on hover */}
                      {isSent && hoveredMessageId === msg._id && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          disabled={deletingMessageId === msg._id}
                          className="p-1.5 md:p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-md z-10 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="Delete message"
                        >
                          {deletingMessageId === msg._id ? (
                            <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiTrash2 size={14} className="md:w-4 md:h-4" />
                          )}
                        </button>
                      )}
                      {renderMessage()}
                    </div>
                  </div>
                )
              })}
            </React.Fragment>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-2 md:mb-3 p-2 md:p-3 bg-gray-50 rounded-lg md:rounded-xl border border-gray-200 flex items-center gap-2 md:gap-3">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg flex-shrink-0" />
          ) : selectedFile.type.startsWith('audio/') ? (
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiMic size={20} className="text-primary md:w-6 md:h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiFile size={20} className="text-primary md:w-6 md:h-6" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-gray-800 truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            {uploadingFile && (
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
          {!uploadingFile && (
            <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <button
                onClick={handleSendFile}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium"
              >
                Send
              </button>
              <button
                onClick={removeSelectedFile}
                className="p-1.5 md:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiX size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Input */}
      <form className="flex gap-1.5 md:gap-2 mt-auto" onSubmit={handleSendMessage}>
        {/* File Upload */}
        <label className="flex items-center cursor-pointer relative group flex-shrink-0">
          <div className="p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FiPaperclip size={18} className={`${uploadingFile ? 'text-primary animate-pulse' : 'text-gray-500 group-hover:text-primary'} transition-colors md:w-5 md:h-5`} />
          </div>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileSelect}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            disabled={uploadingFile || !!selectedFile}
          />
        </label>
        
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg md:rounded-xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm md:text-base"
          disabled={sending || uploadingFile}
        />
        {/* Audio Record */}
        <button
          type="button"
          onClick={handleMicClick}
          className={`p-2 md:p-2.5 rounded-lg transition-colors flex-shrink-0 ${recording ? 'bg-red-100 text-red-500' : 'text-gray-500 hover:text-primary hover:bg-gray-100'}`}
          disabled={uploadingFile || !!selectedFile || sending}
        >
          <FiMic size={18} className={recording ? "animate-pulse" : ""} />
        </button>
        <button 
          type="submit" 
          disabled={sending || uploadingFile || !messageInput.trim() || !!selectedFile}
          className="bg-primary text-white p-2.5 md:p-3 rounded-lg md:rounded-xl hover:bg-primary/90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex-shrink-0"
        >
          <FiSend size={18} className="md:w-5 md:h-5" />
        </button>
      </form>
      {/* Recording indicator */}
      {recording && (
        <div className="text-red-500 mt-2 text-sm flex items-center gap-2">
          <span className="animate-pulse">●</span> Recording...
        </div>
      )}
    </div>
  )
}

export default ChatContainer
