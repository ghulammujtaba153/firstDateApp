import React from 'react'
import { TiTick } from "react-icons/ti";

const MatchCard = ({ item }) => {
  return (
    <div className="relative w-full h-60 rounded-[30px] overflow-hidden shadow">
      {/* Background Image */}
      <img
        src={item.image}
        alt="match"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay: dark bottom → light top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-white/30"></div>

      {/* Content on top of image */}
      <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
        <h3 className="text-lg font-semibold flex items-center gap-1">{item.name} {item.isVerified &&<TiTick className="text-primary bg-white rounded-full text-sm p-0.2"/>}</h3>
        <p className="text-sm">{item.distance}</p>
      </div>
    </div>
  )
}

export default MatchCard
