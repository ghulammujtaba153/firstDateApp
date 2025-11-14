import React from 'react'
import { FiPhoneOff } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const CallCancellationModal = ({ isOpen, cancelledBy, onClose }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleGoToChats = () => {
    if (onClose) {
      onClose()
    }
    navigate('/dashboard/chats')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full mx-4 text-center shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
        {/* Icon */}
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg">
              <FiPhoneOff className="w-10 h-10 text-white" />
            </div>
          </div>
          
          {/* Title */}
          <h3 className="text-3xl font-bold text-gray-900 mb-3">
            Call Cancelled
          </h3>
          
          {/* Message */}
          <div className="space-y-2">
            <p className="text-lg text-gray-600">
              The call was cancelled by
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white font-semibold text-sm">
                  {cancelledBy?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <p className="text-xl font-semibold text-gray-900">
                {cancelledBy || 'Unknown User'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoToChats}
          className="w-full px-6 py-4 bg-primary text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to Chats
        </button>
      </div>
    </div>
  )
}

export default CallCancellationModal
