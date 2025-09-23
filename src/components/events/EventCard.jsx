import React from 'react'
import { FaCalendar } from 'react-icons/fa6'
import { Link } from 'react-router-dom'

const EventCard = ({ item }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-[20px] shadow-md">
      {/* Image with overlay */}
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-[150px] object-cover rounded-[20px]"
        />
        <div className="absolute top-0 left-0  w-full h-full bg-black/30 p-2 rounded-[20px]">
          <p className="bg-white/90 w-[100px] text-center text-black text-sm font-medium rounded-lg px-3 py-1 shadow">
            Next Event
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 mt-3">
        <h1 className="text-lg font-semibold">{item.title}</h1>

        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm">
          <FaCalendar className="mr-2" />
          <span>
            {new Date(item.date).toLocaleString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              hour: "numeric",
              hour12: true,
            })}
          </span>
        </div>

        {/* Sub info */}
        <div className="flex items-center gap-2">
          <img
            src="/diamond.png"
            alt="Event icon"
            className="w-4 h-4 rounded-full"
          />
          <p className="text-gray-600">{item.sub}</p>
        </div>

        <Link to="#" className="bg-primary text-white px-4 py-2 rounded-full text-center w-full hover:bg-transparent hover:text-primary transition">Register</Link>
      </div>
    </div>
  )
}

export default EventCard
