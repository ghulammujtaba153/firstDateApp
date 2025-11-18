import React, { useState, useEffect, useRef } from "react";
import upload from "../../utils/upload";

const PhotosSection = ({ value = [], onChange, setDisable }) => {
  const [images, setImages] = useState([
    ...value,
    ...Array(6 - value.length).fill(null),
  ]);
  const [loadingStates, setLoadingStates] = useState(Array(6).fill(false));
  const isUploadingRef = useRef(false);
  const lastValueRef = useRef(value);

  // Sync with parent value only when it's not from our own onChange
  // Use ref to track if we're currently uploading to prevent sync conflicts
  useEffect(() => {
    // Skip sync if we're currently uploading
    if (isUploadingRef.current) {
      return;
    }
    
    // Skip sync if value hasn't actually changed
    if (JSON.stringify(value) === JSON.stringify(lastValueRef.current)) {
      return;
    }
    
    // Use functional update to get latest images state
    setImages(prevImages => {
      const valueUrls = value || [];
      const currentUrls = prevImages
        .filter(img => img && (typeof img === 'string' || img.url))
        .map(img => typeof img === 'string' ? img : img.url);
      
      // If value is the same as what we have, don't sync (prevents loop)
      if (valueUrls.length === currentUrls.length && 
          valueUrls.every(url => currentUrls.includes(url))) {
        lastValueRef.current = value;
        return prevImages; // Return unchanged
      }
      
      // Map value URLs to existing positions where possible
      const urlToIndexMap = new Map();
      prevImages.forEach((img, idx) => {
        if (img) {
          const imgUrl = typeof img === 'string' ? img : img.url;
          if (imgUrl) {
            urlToIndexMap.set(imgUrl, idx);
          }
        }
      });
      
      const newImages = Array(6).fill(null);
      valueUrls.forEach((url) => {
        const existingIndex = urlToIndexMap.get(url);
        if (existingIndex !== undefined) {
          newImages[existingIndex] = url;
        } else {
          const emptyIndex = newImages.findIndex(img => !img);
          if (emptyIndex !== -1) {
            newImages[emptyIndex] = url;
          }
        }
      });
      
      // Preserve preview/loading states from prevImages
      prevImages.forEach((img, idx) => {
        if (img && typeof img === 'object' && (img.preview || img.loading)) {
          // If this slot doesn't have a URL yet, preserve the preview/loading state
          if (!newImages[idx] || (typeof newImages[idx] === 'string' && img.preview)) {
            newImages[idx] = img;
          }
        }
      });
      
      lastValueRef.current = value;
      return newImages;
    });
  }, [value]);

  const handleImageChange = async (index, file) => {
    if (!file) return;
    setDisable(true);

    isUploadingRef.current = true;

    try {
      // Set loading state for this image
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });

      // Immediately show preview (local) - use functional update to ensure we have latest state
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prevImages => {
          const newImages = [...prevImages];
          newImages[index] = { preview: reader.result, url: null, loading: true };
          return newImages;
        });
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const url = await upload(file);
      setDisable(false);

      if (url) {
        // Use functional update to ensure we have the latest state
        setImages(prevImages => {
          const newImages = [...prevImages];
          newImages[index] = { url, loading: false };
          
          // Notify parent with updated URLs - preserve order based on index
          if (onChange) {
            // Build URLs array preserving the order/positions
            // Simply collect URLs in order from slots 0-5
            const urlsOnly = [];
            newImages.forEach((img, idx) => {
              if (img && (typeof img === 'string' || img.url)) {
                const imgUrl = typeof img === 'string' ? img : img.url;
                if (imgUrl) {
                  urlsOnly.push(imgUrl);
                }
              }
            });
            
            onChange(urlsOnly);
          }
          
          return newImages;
        });

        

        // Clear loading state
        setLoadingStates(prev => {
          const newStates = [...prev];
          newStates[index] = false;
          return newStates;
        });
      }

      setDisable(false);
    } catch (error) {
      console.error("Upload failed:", error);
      setDisable(false);
      // Clear loading state on error
      setLoadingStates(prev => {
        const newStates = [...prev];
        newStates[index] = false;
        return newStates;
      });
      
      // Remove the preview on error
      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages[index] = null;
        return newImages;
      });
    } finally {
      setDisable(false);
      // Allow syncing again after a short delay
      setTimeout(() => {
        isUploadingRef.current = false;
      }, 100);
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
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    handleImageChange(index, file);
                  }
                  // Reset input value to allow selecting the same file again
                  e.target.value = '';
                }}
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