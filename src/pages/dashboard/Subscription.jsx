import React from 'react'
import SubscriptionCard from '../../components/Subscription/SubscriptionCard'

const data = [
  {
    id: 1,
    title: "Basic Plan",
    price: "$9.99/month",
    features: [
      "Unlimited Matches",
      "Priority Support",
      "Customizable Profile",
      "Advanced Search Filters",
      "Access to Exclusive Events",
      "Access to Exclusive Events",
      "Access to Exclusive Events",
    ],
    },
  {
    id: 2,
    title: "Premium Plan",
    price: "$19.99/month",
    features: [
      "Unlimited Matches",
      "Priority Support",
      "Customizable Profile",
      "Advanced Search Filters",
      "Access to Exclusive Events",
      "Access to Exclusive Events",
      "Access to Exclusive Events",
    ],
  },
  {
    id: 3,
    title: "Ultimate Plan",
    price: "$29.99/month",
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
  return (
    <div className='p-4 md:p-8 flex flex-col gap-8 bg-white shadow-xl rounded-[30px]'>
      <h1 className='text-xl font-bold'>Subscriptions</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {
          data.map((item) => (
            <SubscriptionCard key={item.id} item={item} />
          ))
        }
      </div>
    </div>
  )
}

export default Subscription
