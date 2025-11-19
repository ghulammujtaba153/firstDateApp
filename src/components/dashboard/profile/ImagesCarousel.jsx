import React, { useState } from "react";

const ImagesCarousel = ({ images = [] }) => {
  const [current, setCurrent] = useState(0);

  if (!images.length) {
    return (
      <p className="text-center text-gray-500 mt-3">
        No images available to display.
      </p>
    );
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      {/* Image */}
      <img
        src={images[current]}
        alt={`carousel-${current}`}
        className="w-full h-[300px] md:h-[600px] object-cover rounded-lg"
      />

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        &#8592;
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
      >
        &#8594;
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              idx === current ? "bg-primary" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ImagesCarousel;
