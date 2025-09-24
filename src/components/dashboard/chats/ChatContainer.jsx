import React, { useRef, useState } from 'react'
import { FiSend, FiPaperclip, FiMic, FiArrowLeft, FiVideo, FiPhone } from 'react-icons/fi'

const ChatContainer = ({ groupedMessages }) => {
  const [recording, setRecording] = useState(false)
  const [audioURL, setAudioURL] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const handleMicClick = async () => {
    if (recording) {
      // Stop recording
      mediaRecorderRef.current.stop()
      setRecording(false)
    } else {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new window.MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorderRef.current.ondataavailable = event => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const url = URL.createObjectURL(audioBlob)
          setAudioURL(url)
        }

        mediaRecorderRef.current.start()
        setRecording(true)
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white p-6 flex-1">
      {/* Chat Header */}
      <div className="mb-4 border-b pb-2 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <FiArrowLeft size={22} className="text-gray-600" />
          </button>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
            alt="User"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-lg font-semibold">User 1</span>
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
      <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-2">
        {groupedMessages.map(group => (
          <React.Fragment key={group.date}>
            <div className="flex justify-center my-2">
              <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-lg text-xs font-medium">
                {group.date}
              </span>
            </div>
            {group.messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
              >
                <span className={`px-4 py-2 rounded-lg max-w-xs break-words ${msg.sent ? 'bg-primary text-white' : 'bg-gray-50 text-gray-800 border'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </React.Fragment>
        ))}
        {audioURL && (
          <div className="flex justify-end">
            <audio controls src={audioURL} className="mt-2" />
          </div>
        )}
      </div>
      {/* Chat Input */}
      <form className="flex gap-2 mt-auto" onSubmit={e => e.preventDefault()}>
        {/* File Upload */}
        <label className="flex items-center cursor-pointer">
          <FiPaperclip size={20} className="text-gray-500 hover:text-primary" />
          <input type="file" className="hidden" />
        </label>
        
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-4 py-2 border rounded-lg outline-none "
        />
        {/* Audio Record */}
        <button
          type="button"
          onClick={handleMicClick}
          className={`flex items-center cursor-pointer px-2 rounded ${recording ? 'bg-red-100' : ''}`}
        >
          <FiMic size={20} className={recording ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-primary"} />
        </button>
        <button type="submit" className="bg-primary text-white p-4 rounded-full hover:bg-bgprimary flex items-center">
          <FiSend size={22} />
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
