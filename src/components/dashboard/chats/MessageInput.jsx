import React from 'react'
import { FiSend, FiPaperclip, FiMic, FiX, FiFile } from 'react-icons/fi'

const MessageInput = ({
  messageInput,
  setMessageInput,
  sending,
  uploadingFile,
  selectedFile,
  filePreview,
  uploadProgress,
  recording,
  fileInputRef,
  onFileSelect,
  onRemoveFile,
  onSendFile,
  onSendMessage,
  onMicClick
}) => {
  return (
    <>
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
                onClick={onSendFile}
                className="px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs md:text-sm font-medium"
              >
                Send
              </button>
              <button
                onClick={onRemoveFile}
                className="p-1.5 md:p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <FiX size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chat Input */}
      <form className="flex gap-1.5 md:gap-2 mt-auto" onSubmit={onSendMessage}>
        {/* File Upload */}
        <label className="flex items-center cursor-pointer relative group flex-shrink-0">
          <div className="p-2 md:p-2.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FiPaperclip size={18} className={`${uploadingFile ? 'text-primary animate-pulse' : 'text-gray-500 group-hover:text-primary'} transition-colors md:w-5 md:h-5`} />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onFileSelect}
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
          onClick={onMicClick}
          className={`p-2 md:p-2.5 rounded-lg transition-colors flex-shrink-0 ${recording ? 'bg-red-100 text-red-500' : 'text-gray-500 hover:text-primary hover:bg-gray-100'}`}
          disabled={uploadingFile || !!selectedFile || sending}
        >
          <FiMic size={18} className={recording ? "animate-pulse" : ""} />
        </button>
        <button
          type="submit"
          disabled={sending || uploadingFile || !(messageInput || '').trim() || !!selectedFile}
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
    </>
  )
}

export default MessageInput

