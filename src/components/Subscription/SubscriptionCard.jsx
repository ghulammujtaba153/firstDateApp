import React from 'react'
import { FaCheck } from "react-icons/fa6";

const SubscriptionCard = ({item}) => {
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
        <button className='bg-primary text-white px-4 py-2 rounded-full w-full hover:bg-bgprimary hover:text-primary transition'>Subscribe</button>
    </div>
  )
}

export default SubscriptionCard
