import axios from 'axios';
import { BASE_URL } from '../config/url';

/**
 * Create event feedback
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @param {number} rating - Rating (1-5)
 * @param {string} feedback - Feedback text
 * @param {string} token - Auth token
 * @returns {Promise} Feedback response
 */
export const createEventFeedback = async (eventId, userId, rating, feedback, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/event-feedback/create`,
      { eventId, userId, rating, feedback },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create feedback");
  }
};

/**
 * Get event feedbacks
 * @param {string} eventId - Event ID (optional)
 * @param {string} userId - User ID (optional)
 * @param {string} token - Auth token
 * @returns {Promise} Feedback list
 */
export const getEventFeedback = async (eventId = null, userId = null, token = null) => {
  try {
    const params = {};
    if (eventId) params.eventId = eventId;
    if (userId) params.userId = userId;

    const response = await axios.get(
      `${BASE_URL}/api/event-feedback/get`,
      {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to get feedback");
  }
};

/**
 * Get user's feedback for a specific event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise} Feedback or null
 */
export const getUserEventFeedback = async (eventId, userId, token) => {
  try {
    const feedbacks = await getEventFeedback(eventId, userId, token);
    // Return the first feedback if exists (user should only have one feedback per event)
    return Array.isArray(feedbacks) && feedbacks.length > 0 ? feedbacks[0] : null;
  } catch (error) {
    console.error('Error getting user event feedback:', error);
    return null;
  }
};

/**
 * Delete event feedback
 * @param {string} feedbackId - Feedback ID
 * @param {string} token - Auth token
 * @returns {Promise} Delete response
 */
export const deleteEventFeedback = async (feedbackId, token) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/event-feedback/delete/${feedbackId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to delete feedback");
  }
};

