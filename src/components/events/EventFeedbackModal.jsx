import React, { useState, useEffect } from 'react';
import { createEventFeedback, getUserEventFeedback } from '../../services/eventFeedbackService';

const EventFeedbackModal = ({ isOpen, onClose, event, userId, token, onSuccess, existingFeedback = null }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && event && userId) {
      // Load existing feedback if provided, otherwise fetch it
      const loadExistingFeedback = async () => {
        try {
          setLoading(true);
          setError('');
          
          // Use existingFeedback prop if provided, otherwise fetch
          let userFeedback = existingFeedback;
          
          if (!userFeedback) {
            userFeedback = await getUserEventFeedback(event._id, userId, token);
          }
          
          if (userFeedback) {
            setRating(userFeedback.rating || 0);
            setFeedback(userFeedback.feedback || '');
          } else {
            setRating(0);
            setFeedback('');
          }
        } catch (err) {
          console.error('Error loading existing feedback:', err);
          // Don't show error, just start with empty form
          setRating(0);
          setFeedback('');
        } finally {
          setLoading(false);
        }
      };

      loadExistingFeedback();
    } else if (!isOpen) {
      // Reset form when modal closes
      setRating(0);
      setFeedback('');
      setError('');
      setHoveredRating(0);
    }
  }, [isOpen, event?._id, userId, token, existingFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating from 1 to 5 stars');
      return;
    }

    if (!feedback.trim()) {
      setError('Please provide your feedback');
      return;
    }

    if (feedback.trim().length < 10) {
      setError('Feedback must be at least 10 characters long');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await createEventFeedback(event._id, userId, rating, feedback.trim(), token);
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setFeedback('');
    setError('');
    setHoveredRating(0);
    onClose();
  };

  if (!isOpen || !event) return null;

  const displayRating = hoveredRating || rating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Event Feedback</h2>
              {existingFeedback || (rating > 0 && feedback) ? (
                <p className="text-sm text-gray-600 mt-1">Update your feedback</p>
              ) : (
                <p className="text-sm text-gray-600 mt-1">Share your experience</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Event Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
            {event.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none transition-transform transform hover:scale-110"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <svg
                        className={`w-10 h-10 ${
                          star <= displayRating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      {rating} {rating === 1 ? 'star' : 'stars'}
                    </span>
                  )}
                </div>
                {!rating && hoveredRating === 0 && (
                  <p className="text-xs text-gray-500 mt-1">Click to select your rating</p>
                )}
              </div>

              {/* Feedback Text Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience with this event..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                  required
                  minLength={10}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">Minimum 10 characters</p>
                  <p className={`text-xs ${feedback.length < 10 ? 'text-gray-500' : 'text-green-600'}`}>
                    {feedback.length} characters
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !rating || feedback.trim().length < 10}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Submitting...' : existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventFeedbackModal;

