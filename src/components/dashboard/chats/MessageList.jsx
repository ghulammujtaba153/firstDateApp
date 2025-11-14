import React from 'react'
import { FiTrash2, FiMic, FiFile, FiDownload, FiPhone, FiVideo } from 'react-icons/fi'
import { BASE_URL } from '../../../config/url'

const MessageList = ({
  messages,
  loading,
  currentUserId,
  currentUser,
  onDeleteMessage,
  deletingMessageId,
  hoveredMessageId,
  setHoveredMessageId,
  messagesEndRef
}) => {
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

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return ''
    
    const messageDate = new Date(timestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())
    
    // Check if message is from today
    const isToday = messageDay.getTime() === today.getTime()
    
    // Format time
    const time = messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    
    // If today, just show time. Otherwise show date and time
    if (isToday) {
      return time
    } else {
      const date = messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
      return `${date} ${time}`
    }
  }

  // Render different message types
  const renderMessage = (msg, isSent) => {
    if (msg.messageType === 'image') {
      const imageUrl = (typeof msg.content === 'string' && msg.content.startsWith('http')) ? msg.content : `${BASE_URL}${msg.content}`
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
      const videoUrl = (typeof msg.content === 'string' && msg.content.startsWith('http')) ? msg.content : `${BASE_URL}${msg.content}`
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
      const audioUrl = (typeof msg.content === 'string' && msg.content.startsWith('http')) ? msg.content : `${BASE_URL}${msg.content}`
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
      const fileName =
        typeof msg.content === 'string' && msg.content.split
          ? msg.content.split('/').pop() || 'File'
          : 'File';

      const fileUrl =
        typeof msg.content === 'string' && msg.content.startsWith('http')
          ? msg.content
          : `${BASE_URL}${msg.content}`;

      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`max-w-[85%] md:max-w-md px-3 md:px-4 py-2 md:py-3 rounded-xl break-words flex flex-col gap-2 md:gap-3 shadow-sm transition-all text-sm md:text-base 
        ${isSent
              ? 'bg-primary text-white hover:bg-primary/90'  // PUSH RIGHT
              : 'bg-gray-50 text-gray-800 border hover:bg-gray-100' // PUSH LEFT
            }
      `}
        >
          {/* Icon + File Name */}
          <div className="flex items-center gap-2 md:gap-3">
            <FiFile size={18} className="flex-shrink-0 md:w-5 md:h-5" />
            <span className="truncate">{fileName}</span>
          </div>

          {/* Download Button (full width) */}
          <button
            className="flex items-center justify-center gap-2 py-2 bg-white text-primary rounded-lg border hover:bg-gray-50 font-medium"
          >
            <FiDownload size={16} /> Download
          </button>
        </a>
      );
    }


    if (msg.messageType === 'videoCall' || msg.messageType === 'audioCall') {
      const isVideoCall = msg.messageType === 'videoCall'
      const callText = isVideoCall ? 'Video call' : 'Audio call'
      const callIcon = isVideoCall ? FiVideo : FiPhone
      const IconComponent = callIcon

      return (
        <div className={`px-3 md:px-4 py-2 md:py-3 rounded-xl max-w-[85%] md:max-w-md break-words flex items-center gap-2 md:gap-3 shadow-sm text-sm md:text-base ${isSent ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-gray-50 text-gray-800 border border-gray-200'}`}>
          <IconComponent size={18} className="flex-shrink-0 md:w-5 md:h-5" />
          <span className="flex-1">{msg.content || `${callText} ${isSent ? 'initiated' : 'received'}`}</span>
        </div>
      )
    }

    // Text message (fallback)
    return (
      <div className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl max-w-[85%] md:max-w-md break-words shadow-sm text-sm md:text-base ${isSent ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800 border'}`}>
        {msg.content}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto mb-3 md:mb-4 flex flex-col gap-2 md:gap-3 slim-scrollbar px-1 md:px-2">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading messages...</p>
        </div>
        <div ref={messagesEndRef} />
      </div>
    )
  }

  if (groupedMessages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto mb-3 md:mb-4 flex flex-col gap-2 md:gap-3 slim-scrollbar px-1 md:px-2">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">No messages yet. Start the conversation!</p>
        </div>
        <div ref={messagesEndRef} />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto mb-3 md:mb-4 flex flex-col gap-2 md:gap-3 slim-scrollbar px-1 md:px-2">
      {groupedMessages.map(group => (
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
            const isCallMessage = msg.messageType === 'videoCall' || msg.messageType === 'audioCall'
            const canDelete = isSent && !isCallMessage

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} group relative`}
                onMouseEnter={() => setHoveredMessageId(msg._id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                <div className={`relative flex items-center gap-2 ${isSent ? 'flex-row' : 'flex-row-reverse'}`}>
                  {/* Delete button - only show for sent messages (except call messages) on hover */}
                  {canDelete && hoveredMessageId === msg._id && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDeleteMessage(msg._id)
                      }}
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
                  <div className="relative">
                    {renderMessage(msg, isSent)}
                  </div>
                </div>
                {/* Message timestamp */}
                <span className={`text-xs text-gray-500 mt-1 px-1 ${isSent ? 'text-right' : 'text-left'}`}>
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            )
          })}
        </React.Fragment>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList

