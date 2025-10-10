import React, { useState, useEffect } from "react";
import upload from "../../utils/upload";

const PhotosSection = ({ value = [], onChange }) => {
  const [images, setImages] = useState([
    ...value,
    ...Array(6 - value.length).fill(null),
  ]);
  const [loadingStates, setLoadingStates] = useState(Array(6).fill(false));

  // Sync with parent value
  useEffect(() => {
    setImages([...value, ...Array(6 - value.length).fill(null)]);
  }, [value]);

  const handleImageChange = async (index, file) => {
    if (!file) return;

    try {
      // Set loading state for this image
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });

      // Immediately show preview (local)
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = { preview: reader.result, url: null, loading: true };
        setImages(newImages);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const url = await upload(file);

      if (url) {
        const newImages = [...images];
        newImages[index] = { url, loading: false };
        setImages(newImages);

        // Clear loading state
        setLoadingStates(prev => {
          const newStates = [...prev];
          newStates[index] = false;
          return newStates;
        });

        if (onChange) {
          const urlsOnly = newImages
            .filter(img => img && img.url !== null && img.url !== undefined)
            .map(img => img.url);
          onChange(urlsOnly);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
      // Clear loading state on error
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = false;
        return newStates;
      });
    }
  };

  // Helper function to normalize image data structure
  const getImageData = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return { url: img, loading: false };
    return img;
  };

  // Helper function to get image source
  const getImageSrc = (img) => {
    const data = getImageData(img);
    if (!data) return null;
    return data.url || data.preview;
  };

  // Helper function to check if image is loading
  const isLoading = (img, index) => {
    const data = getImageData(img);
    return loadingStates[index] || (data && data.loading);
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
        {images.map((img, index) => {
          const imageData = getImageData(img);
          const imageSrc = getImageSrc(img);
          const loading = isLoading(img, index);

          return (
            <label
              key={index}
              className="w-full aspect-square bg-gray-100 flex items-center justify-center rounded-lg cursor-pointer overflow-hidden relative"
            >
              {loading ? (
                // Shimmer effect
                <div className="w-full h-full bg-gray-200 animate-pulse">
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer bg-[length:200%_100%]"></div>
                </div>
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    // Clear loading state when image finishes loading
                    if (imageData && imageData.loading) {
                      const newImages = [...images];
                      if (newImages[index] && newImages[index].loading) {
                        newImages[index].loading = false;
                        setImages(newImages);
                      }
                    }
                  }}
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
                disabled={loading}
              />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PhotosSection;