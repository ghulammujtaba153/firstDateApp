import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SubscriptionCard from '../../components/Subscription/SubscriptionCard'
import { useAuth } from '../../context/authContext'
import axios from 'axios'
import { BASE_URL } from '../../config/url'
import Loader from '../../components/common/Loader'

const Subscription = () => {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [packages, setPackages] = useState([])
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

  useEffect(() => {
    fetchAllPackages()
  }, [])

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

  const fetchAllPackages = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${BASE_URL}/api/package/get`)

      // Transform API data to match the expected format
      const transformedPackages = res.data
        .filter(pkg => pkg.active) // Only show active packages
        .map(pkg => ({
          id: pkg._id,
          title: pkg.title,
          price: formatPrice(pkg.price, pkg.type),
          planId: pkg._id, // Use MongoDB _id as planId
          features: pkg.features || [],
          mostPopular: pkg.mostPopular,
          description: pkg.description,
          stripePriceId: pkg.stripePriceId,
          stripeProductId: pkg.stripeProductId,
        }))
        .sort((a, b) => {
          // Sort by price (ascending)
          const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''))
          const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''))
          return priceA - priceB
        })

      setPackages(transformedPackages)
    } catch (error) {
      console.error('Error fetching packages:', error)
      // Fallback to empty array if fetch fails
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price, type) => {
    const formattedPrice = `$${price.toFixed(2)}`

    switch (type) {
      case 'monthly':
        return `${formattedPrice}/month`
      case 'yearly':
        return `${formattedPrice}/year`
      case 'weekly':
        return `${formattedPrice}/week`
      case 'one-time':
        return formattedPrice
      default:
        return formattedPrice
    }
  }

  if (loading) return <Loader />

  return (
    <div className='p-4 md:p-8 flex flex-col gap-8 bg-white shadow-xl rounded-[30px]'>
      <div className='flex flex-col gap-4'>
        <h1 className='text-xl font-bold'>Subscriptions</h1>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-lg ${message.includes('successful')
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
              ✓ You have an active {subscriptionStatus.subscription?.planName} package.
            </p>
            {/* {subscriptionStatus.premiumUntil && (
              <p className='text-sm text-blue-600 mt-1'>
                Premium until: {new Date(subscriptionStatus.premiumUntil).toLocaleDateString()}
              </p>
            )} */}
          </div>
        )}
      </div>

      {/* Packages Grid */}
      {packages.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {packages.map((item) => (
            <SubscriptionCard
              key={item.id}
              item={item}
              userId={user?._id || user?.id}
              onSubscribe={fetchUserSubscription}
            />
          ))}
        </div>
      ) : (
        <div className='text-center py-12'>
          <p className='text-gray-500'>No subscription packages available at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default Subscription
