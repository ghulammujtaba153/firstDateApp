import React from 'react'

const LocationSection = () => {
  return (
    <div className="text-center">
      {/* Icon container */}
      <div className="border border-gray-300 p-10 rounded-full my-6 w-fit mx-auto">
        <img
          src="/location-mark.png"
          alt="location"
          className="w-15 h-15"
        />
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold mb-2">
        Enable Location
      </h1>

      {/* Description */}
      <p className="text-gray-600 max-w-md mx-auto">
        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      </p>
    </div>
  )
}

export default LocationSection
