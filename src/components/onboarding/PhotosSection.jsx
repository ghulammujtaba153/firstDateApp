import React, { useState } from "react";

const PhotosSection = () => {
  const [images, setImages] = useState(Array(6).fill(null));

  const handleImageChange = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images];
      newImages[index] = reader.result;
      setImages(newImages);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="my-4 text-left">
        <h1 className="text-xl font-bold">Show your best self 📸</h1>
      <p className="text-gray-600 mt-2">
        Upload up to 6 photos. Choose your best shots!
      </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {images.map((img, index) => (
          <label
            key={index}
            className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-lg cursor-pointer overflow-hidden relative"
          >
            {img ? (
              <img
                src={img}
                alt={`preview-${index}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-gray-300">+</span>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                handleImageChange(index, e.target.files?.[0] || null)
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;
