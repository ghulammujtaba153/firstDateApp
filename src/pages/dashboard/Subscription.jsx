import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SubscriptionCard from '../../components/Subscription/SubscriptionCard'
import { useAuth } from '../../context/authContext'
import axios from 'axios'
import { BASE_URL } from '../../config/url'
import Loader from '../../components/common/Loader'

const data = [
  {
    id: 1,
    title: "Basic Plan",
    price: "$9.99/month",
    planId: "basic",
    features: [
      "Unlimited Matches",
      "Priority Support",
      "Customizable Profile",
      "Advanced Search Filters",
      "Access to Exclusive Events",
    ],
  },
  {
    id: 2,
    title: "Premium Plan",
    price: "$19.99/month",
    planId: "premium",
    features: [
      "Unlimited Matches",
      "Priority Support",
      "Customizable Profile",
      "Advanced Search Filters",
      "Access to Exclusive Events",
      "Priority Matchmaking",
    ],
  },
  {
    id: 3,
    title: "Ultimate Plan",
    price: "$29.99/month",
    planId: "ultimate",
    features: [
      "Unlimited Matches",
      "Priority Support",
      "Customizable Profile",
      "Advanced Search Filters",
      "Access to Exclusive Events",
      "Priority Matchmaking",
      "Access to VIP Events",
    ],
  },
]

const Subscription = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check for success/cancel from Stripe redirect
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')
    const sessionId = searchParams.get('session_id')

    if (success === 'true' && sessionId) {
      // Verify the checkout session and process subscription
      verifyCheckoutSession(sessionId)
    } else if (canceled === 'true') {
      setMessage('Subscription was canceled.')
      setLoading(false)
    } else {
      // Fetch current subscription status
      if (user?._id) {
        fetchUserSubscription()
      } else {
        setLoading(false)
      }
    }
  }, [user, searchParams])

  const verifyCheckoutSession = async (sessionId) => {
    try {
      setLoading(true)
      setMessage('Verifying your subscription...')
      
      const response = await axios.post(`${BASE_URL}/api/app-subscriptions/verify-session`, {
        sessionId
      })

      if (response.data.success) {
        setMessage('Subscription successful! Your premium features are now active.')
        // Refresh user data to get updated premium status
        if (user?._id) {
          await fetchUserSubscription()
        }
      } else {
        setMessage('Subscription verification failed. Please contact support.')
      }
    } catch (error) {
      console.error('Error verifying checkout session:', error)
      setMessage('Subscription verification failed. Please contact support if the payment was successful.')
      // Still try to fetch subscription status in case webhook processed it
      if (user?._id) {
        await fetchUserSubscription()
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUserSubscription = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BASE_URL}/api/app-subscriptions/user/${user._id}`)
      setSubscriptionStatus(response.data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className='p-4 md:p-8 flex flex-col gap-8 bg-white shadow-xl rounded-[30px]'>
      <div className='flex flex-col gap-4'>
        <h1 className='text-xl font-bold'>Subscriptions</h1>
        
        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('successful') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}>
            {message}
          </div>
        )}

        {/* Current Subscription Status */}
        {subscriptionStatus?.hasSubscription && (
          <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <p className='text-blue-800 font-medium'>
              ✓ You have an active {subscriptionStatus.subscription?.planName}
            </p>
            {subscriptionStatus.premiumUntil && (
              <p className='text-sm text-blue-600 mt-1'>
                Premium until: {new Date(subscriptionStatus.premiumUntil).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {data.map((item) => (
          <SubscriptionCard
            key={item.id}
            item={item}
            userId={user?._id || user?.id}
            onSubscribe={fetchUserSubscription}
          />
        ))}
      </div>
    </div>
  )
}

export default Subscription
