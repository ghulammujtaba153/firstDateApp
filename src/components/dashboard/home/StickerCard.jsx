import React from "react";
import { Link } from "react-router-dom";

const StickerCard = ({ item }) => {
  return (
    <div
      className="relative w-full p-4 h-[200px] overflow-hidden shadow hover:shadow-lg transition bg-cover bg-center rounded-[30px]"
      style={{ backgroundImage: `url('/sticker.png')` }}
    >
      

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col h-full justify-center text-white">
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <p className="text-sm mt-1">{item.description}</p>

        {/* Link button */}
        <Link
          to={item.link}
          className="mt-3 w-[200px] inline-block px-3 py-4 text-center bg-white rounded-full text-primary text-sm font-medium hover:bg-white/70 transition"
        >
          {item.linkText}
        </Link>
      </div>
    </div>
  );
};

export default StickerCard;
