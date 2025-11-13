import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { createPaymentIntent, verifyPaymentAndJoinEvent } from '../../services/paymentService';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const PaymentForm = ({ event, userId, token, onSuccess, onClose, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createIntent = async () => {
      try {
        const response = await createPaymentIntent(event._id, userId, token);
        if (response.requiresPayment) {
          setClientSecret(response.clientSecret);
          setAmount(response.amount);
        } else {
          // Free event, join directly
          onSuccess();
          onClose();
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize payment');
        onError(err.message || 'Failed to initialize payment');
      }
    };

    if (event && userId) {
      createIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?._id, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Verify payment and join event
        try {
          await verifyPaymentAndJoinEvent(event._id, userId, paymentIntent.id, token);
          onSuccess();
          onClose();
        } catch (err) {
          setError(err.message || 'Failed to join event after payment');
          onError(err.message || 'Failed to join event after payment');
        }
      } else {
        setError('Payment was not completed');
        onError('Payment was not completed');
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed');
      onError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!clientSecret && amount === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Event:</span>
          <span className="font-semibold">{event.title}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount:</span>
          <span className="text-xl font-bold text-primary">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElement options={cardElementOptions} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const PaymentModal = ({ isOpen, onClose, event, userId, token, onSuccess, onError }) => {
  if (!isOpen || !event) return null;

  if (!stripePromise) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Payment Error</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <div className="text-red-500 mb-4">
            Stripe publishable key is not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <Elements stripe={stripePromise}>
            <PaymentForm
              event={event}
              userId={userId}
              token={token}
              onSuccess={onSuccess}
              onClose={onClose}
              onError={onError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

