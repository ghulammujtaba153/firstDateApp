import axios from 'axios';
import { BASE_URL } from '../config/url';

/**
 * Create payment intent for event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise} Payment intent response
 */
export const createPaymentIntent = async (eventId, userId, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payments/create-intent`,
      { eventId, userId },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create payment intent");
  }
};

/**
 * Verify payment and join event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @param {string} paymentIntentId - Payment Intent ID
 * @param {string} token - Auth token
 * @returns {Promise} Join event response
 */
export const verifyPaymentAndJoinEvent = async (eventId, userId, paymentIntentId, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payments/verify-and-join`,
      { eventId, userId, paymentIntentId },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to verify payment");
  }
};

/**
 * Get payment status for event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise} Payment status
 */
export const getPaymentStatus = async (eventId, userId, token) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/payments/status/${eventId}/${userId}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to get payment status");
  }
};

/**
 * Refund payment for event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @param {string} token - Auth token
 * @returns {Promise} Refund response
 */
export const refundPayment = async (eventId, userId, token) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/payments/refund`,
      { eventId, userId },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to refund payment");
  }
};

