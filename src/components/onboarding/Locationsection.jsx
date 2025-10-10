import React from "react";

const LocationSection = ({ value, onChange }) => {
  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { latitude, longitude };
        onChange(location); // Pass location back to parent
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to fetch location. Please enable location access.");
      }
    );
  };

  return (
    <div className="text-center">
      {/* Icon container */}
      <div className="border border-gray-300 p-10 rounded-full my-6 w-fit mx-auto">
        <img src="/location-mark.png" alt="location" className="w-15 h-15" />
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold mb-2">Enable Location</h1>

      {/* Description */}
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        Allow us to access your location to provide better recommendations.
      </p>

      {/* Enable Button */}
      <button
        onClick={handleEnableLocation}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Enable Location
      </button>

      {/* Show selected location */}
      {value && (
        <p className="mt-4 text-sm text-gray-700">
          📍 Location Enabled: {value.latitude}, {value.longitude}
        </p>
      )}
    </div>
  );
};

export default LocationSection;
