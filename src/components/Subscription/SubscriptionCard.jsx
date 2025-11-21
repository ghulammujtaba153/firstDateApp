import React, { useState } from 'react'
import { FaCheck } from "react-icons/fa6";
import axios from 'axios';
import { BASE_URL } from '../../config/url';

const SubscriptionCard = ({ item, userId, onSubscribe }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  console.log("item in subscription card", item)

  const handleSubscribe = async () => {
    if (!userId) {
      setError('Please log in to subscribe');
      return;
    }

    try {
      setLoading(true);
      setError('');






      // Create checkout session
      const response = await axios.post(`${BASE_URL}/api/app-subscriptions/checkout`, {
        userId,
        planId: item.id,
      });

      if (response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError(err.response?.data?.error || 'Failed to start subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='border bg-gray-50 p-4 rounded-[30px] shadow-sm flex flex-col gap-4'>
      <div className='flex flex-col items-center justify-center gap-2'>
        <p className='text-primary bg-bgprimary/10 rounded-full px-4 py-2'>{item.title}</p>
        <h1 className='text-3xl font-semibold'>{item.price}</h1>
      </div>
      <div className='w-full h-[1px] bg-gray-200'></div>
      <div>
        {item.features.map((feature, index) => (
          <div className='flex items-center gap-6 text-gray-600' key={index}>
            <FaCheck />
            <p>{feature}</p>
          </div>
        ))}
      </div>
      <div className='w-full h-[1px] bg-gray-200'></div>
      {error && (
        <div className='text-red-500 text-sm text-center'>{error}</div>
      )}
      <button
        onClick={handleSubscribe}
        disabled={loading || !userId}
        className='bg-primary text-white px-4 py-2 rounded-full w-full hover:bg-bgprimary hover:text-primary transition disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? 'Processing...' : 'Subscribe'}
      </button>
    </div>
  )
}

export default SubscriptionCard
